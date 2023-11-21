import React from 'react';
import { StyledList, StyledListItem } from './StyledList';

export type Item = {
  key: string;
  label: string;
};

export type DragData = {
  listId: string;
  items: Item[];
};

type Props = {
  listId: string;
  items: Item[];
  dragData: DragData;
  onSetDraggedItems: (dragData: DragData) => void;
  onSetItems: (items: Item[]) => void;
  onDropped: (dragData: DragData) => void;
  onItemDoubleClick?: (index: number) => void;
};

type State = {
  selectedItems: string[];
};

export class SmartSelect extends React.Component<Props, State> {
  state = {
    selectedItems: [] as string[]
  };

  handleItemClick = (event: React.MouseEvent<HTMLLIElement>, key: string) => {
    this.setState((prevState) => {
      if (event.ctrlKey || event.metaKey) {
        return { selectedItems: [...prevState.selectedItems, key] };
      } else if (event.shiftKey) {
        const lastSelectedItem = prevState.selectedItems[prevState.selectedItems.length - 1];
        const items = this.props.items;
        const lastIndex = items.findIndex((item) => item.key === lastSelectedItem);
        const currentIndex = items.findIndex((item) => item.key === key);
        const minIndex = Math.min(lastIndex, currentIndex);
        const maxIndex = Math.max(lastIndex, currentIndex);
        const selectedItems = items.slice(minIndex, maxIndex + 1).map((item) => item.key);
        return { selectedItems };
      } else {
        return { selectedItems: [key] };
      }
    });
  };

  handleDragStart = (event: React.DragEvent<HTMLLIElement>) => {
    const itemKey = event.currentTarget.getAttribute('data-key');
    event.dataTransfer?.setData('text/plain', itemKey || '');

    this.props.onSetDraggedItems({
      listId: this.props.listId,
      items: this.props.items.filter((x) => this.state.selectedItems.includes(x.key))
    });
  };

  handleDragOver = (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();

    if (event.clientY - rect.top < rect.height / 2) {
      event.currentTarget.style.borderTop = '2px solid red';
      event.currentTarget.style.borderBottom = 'none';
    }
  };

  handleDragLeave = (event: React.DragEvent<HTMLLIElement>) => {
    event.currentTarget.style.borderTop = 'none';
    event.currentTarget.style.borderBottom = '1px solid #ccc';
  };

  handleDrop = (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();

    console.log('dragData', this.props.dragData);

    event.currentTarget.style.borderTop = 'none';
    event.currentTarget.style.borderBottom = 'none';

    const dropKey = event.currentTarget.getAttribute('data-key');

    // if the items are being dragged within this list
    if (this.props.dragData.listId === this.props.listId) {
      const selectedItemsCopy = [
        ...this.props.items.filter((item) => this.state.selectedItems.includes(item.key))
      ];

      const newItemsWithoutSelected = [
        ...this.props.items.filter((item) => !this.state.selectedItems.includes(item.key))
      ];

      const dropIndex = newItemsWithoutSelected.findIndex((item) => item.key === dropKey);

      // insert the selected items before the drop index
      const newItems = [
        ...newItemsWithoutSelected.slice(0, dropIndex),
        ...selectedItemsCopy,
        ...newItemsWithoutSelected.slice(dropIndex)
      ];

      this.props.onSetItems(newItems);
    } else {
      const dropIndex = this.props.items.findIndex((item) => item.key === dropKey);

      // insert the selected items before the drop index
      const newItems = [
        ...this.props.items.slice(0, dropIndex),
        ...this.props.dragData.items,
        ...this.props.items.slice(dropIndex)
      ];

      this.props.onSetItems(newItems);
      this.props.onDropped(this.props.dragData);
    }
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>, itemIndex: number) => {
    const { key } = event;
    const target = event.target as HTMLLIElement;

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();

      const newIndex = key === 'ArrowUp' ? itemIndex - 1 : itemIndex + 1;

      if (newIndex < 0) {
        return;
      }

      if (newIndex >= this.props.items.length) {
        return;
      }

      target.blur();

      if (key === 'ArrowDown') {
        (target.nextElementSibling as HTMLLIElement)?.focus();
      } else {
        (target.previousElementSibling as HTMLLIElement)?.focus();
      }

      if (event.shiftKey && key === 'ArrowDown') {
        this.setState({
          selectedItems: [...this.state.selectedItems, this.props.items[newIndex].key]
        });

        // if the current item is selected and the one below is selected, remove the current item from the selection
        if (
          this.state.selectedItems.includes(this.props.items[itemIndex].key) &&
          this.state.selectedItems.includes(this.props.items[newIndex].key)
        ) {
          this.setState({
            selectedItems: this.state.selectedItems.filter(
              (itemKey) => itemKey !== this.props.items[itemIndex].key
            )
          });
        }
      } else if (event.shiftKey && key === 'ArrowUp') {
        this.setState({
          selectedItems: [...this.state.selectedItems, this.props.items[newIndex].key]
        });

        // if the current item is selected and the one above is selected, remove the current item from the selection
        if (
          this.state.selectedItems.includes(this.props.items[itemIndex].key) &&
          this.state.selectedItems.includes(this.props.items[newIndex].key)
        ) {
          this.setState({
            selectedItems: this.state.selectedItems.filter(
              (itemKey) => itemKey !== this.props.items[itemIndex].key
            )
          });
        }
      } else {
        this.setState({ selectedItems: [this.props.items[newIndex].key] });
      }
    }
  };

  render() {
    return (
      <StyledList>
        {this.props.items.map((item, index) => (
          <StyledListItem
            tabIndex={index}
            key={item.key}
            data-key={item.key}
            draggable
            onDragStart={this.handleDragStart}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
            onClick={(event) => this.handleItemClick(event, item.key)}
            onDoubleClick={() => this.props.onItemDoubleClick?.(index)}
            onKeyDown={(event) => this.handleKeyDown(event, index)}
            $isSelected={this.state.selectedItems.includes(item.key)}
          >
            {item.label}
          </StyledListItem>
        ))}
      </StyledList>
    );
  }
}
