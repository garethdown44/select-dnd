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
  onItemDoubleClick?: (key: string) => void;
};

type State = {
  selectedItems: string[];
};

export class SmartSelect extends React.Component<Props, State> {
  state = {
    selectedItems: [] as string[]
  };

  dropPosition: 'before' | 'after' = 'before';

  constructor(props: Props) {
    super(props);
  }

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

  handleDragStart = (event: React.DragEvent<HTMLElement>) => {
    const itemKey = event.currentTarget.getAttribute('data-key');
    event.dataTransfer?.setData('text/plain', itemKey || '');

    if (!itemKey) {
      return;
    }

    const itemsBeingDragged =
      this.state.selectedItems.length > 0
        ? this.props.items.filter((x) => this.state.selectedItems.includes(x.key))
        : this.props.items.filter((x) => x.key === itemKey);

    this.props.onSetDraggedItems({
      listId: this.props.listId,
      items: itemsBeingDragged
    });
  };

  handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    if (event.currentTarget.tagName === 'UL') {
      if (this.props.items.length === 0) {
        event.currentTarget.style.background = '#eee';
      } else {
        const lastLiElement = event.currentTarget.lastChild as HTMLLIElement;

        if (lastLiElement) {
          // if the mouse is past the last li element
          if (event.clientY - lastLiElement.getBoundingClientRect().bottom > 0) {
            lastLiElement.style.borderTop = 'none';
            lastLiElement.style.borderBottom = '2px solid red';
            this.dropPosition = 'after';
            return;
          }
        }
      }
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    if (event.clientY - rect.top < rect.height / 2) {
      event.currentTarget.style.borderTop = '2px solid red';
      event.currentTarget.style.borderBottom = 'none';
      this.dropPosition = 'before';
      return;
    }
  };

  handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (event.currentTarget.tagName === 'UL' && this.props.items.length > 0) {
      const lastLiElement = event.currentTarget.lastChild as HTMLLIElement;

      if (lastLiElement) {
        lastLiElement.style.borderTop = 'none';
        lastLiElement.style.borderBottom = 'none';
        return;
      }
    }

    if (event.currentTarget.tagName === 'UL') {
      event.currentTarget.style.background = 'none';
      return;
    }

    event.currentTarget.style.borderTop = 'none';
    event.currentTarget.style.borderBottom = 'none';
  };

  handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    let dropKey: string | null = null;

    if (event.currentTarget.tagName !== 'UL') {
      event.currentTarget.style.borderTop = 'none';
      event.currentTarget.style.borderBottom = 'none';
    }

    if (event.currentTarget.tagName === 'UL') {
      event.currentTarget.style.background = 'none';

      const lastLiElement = event.currentTarget.lastChild as HTMLLIElement;

      // the UL should only respond to this event when there are no items.
      // otherwise the event gets handled twice
      if (this.props.items.length > 0) {
        const isMousePastLastLiElement =
          event.clientY - lastLiElement.getBoundingClientRect().bottom > 0;

        if (!isMousePastLastLiElement) {
          return;
        }
      }

      if (lastLiElement) {
        lastLiElement.style.borderBottom = 'none';
        dropKey = lastLiElement.getAttribute('data-key');
      }
    }

    dropKey ??= event.currentTarget.getAttribute('data-key');

    // if the items are being dragged within this list
    if (this.props.dragData.listId === this.props.listId) {
      const selectedItemsCopy = [
        ...this.props.items.filter((item) => this.state.selectedItems.includes(item.key))
      ];

      const newItemsWithoutSelected = [
        ...this.props.items.filter((item) => !this.state.selectedItems.includes(item.key))
      ];

      const dropIndex = newItemsWithoutSelected.findIndex((item) => item.key === dropKey);
      const indexToInsert = this.dropPosition === 'before' ? dropIndex : dropIndex + 1;

      const newItems = [
        ...newItemsWithoutSelected.slice(0, indexToInsert),
        ...selectedItemsCopy,
        ...newItemsWithoutSelected.slice(indexToInsert)
      ];

      this.props.onSetItems(newItems);
    } else {
      const dropIndex = this.props.items.findIndex((item) => item.key === dropKey);

      const indexToInsert = this.dropPosition === 'before' ? dropIndex : dropIndex + 1;

      const newItems = [
        ...this.props.items.slice(0, indexToInsert),
        ...this.props.dragData.items,
        ...this.props.items.slice(indexToInsert)
      ];

      this.props.onSetItems(newItems);
      this.props.onDropped(this.props.dragData);

      this.setState({ selectedItems: this.props.dragData.items.map((item) => item.key) });

      // focus the first item that was dropped
      setTimeout(() => {
        if (this.state.selectedItems.length === 0) {
          return;
        }

        const firstSelectedItem = document.querySelector(
          `[data-key="${this.state.selectedItems[0]}"]`
        ) as HTMLLIElement;

        if (firstSelectedItem) {
          firstSelectedItem.focus();
        }
      }, 0);
    }
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>, itemIndex: number) => {
    const { key } = event;
    const target = event.target as HTMLLIElement;

    if ((event.ctrlKey || event.metaKey) && key === 'a') {
      event.preventDefault();
      this.setState({ selectedItems: this.props.items.map((item) => item.key) });
      return;
    }

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

      if (event.shiftKey && (event.metaKey || event.ctrlKey) && key === 'ArrowDown') {
        event.preventDefault();
        // select all the items below the current item
        const indexOfSelectedItem = this.props.items.findIndex(
          (item) => item.key === this.state.selectedItems[0]
        );

        const itemsBelow = this.props.items.slice(indexOfSelectedItem + 1);

        this.setState({
          selectedItems: [...this.state.selectedItems, ...itemsBelow.map((item) => item.key)]
        });

        const lastLiElement = target.parentElement?.lastChild as HTMLLIElement;

        if (lastLiElement) {
          lastLiElement.focus();
        }

        return;
      }

      if (event.shiftKey && (event.metaKey || event.ctrlKey) && key === 'ArrowUp') {
        event.preventDefault();
        // select all the items above the current item
        const indexOfSelectedItem = this.props.items.findIndex(
          (item) => item.key === this.state.selectedItems[0]
        );

        const itemsAbove = this.props.items.slice(0, indexOfSelectedItem);

        this.setState({
          selectedItems: [...this.state.selectedItems, ...itemsAbove.map((item) => item.key)]
        });

        const firstLiElement = target.parentElement?.firstChild as HTMLLIElement;

        if (firstLiElement) {
          firstLiElement.focus();
        }

        return;
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

      return;
    }

    // for any other key, jump to the next item that starts with that letter
    const letter = key.toLowerCase();
    const indexOfSelectedItem = this.props.items.findIndex(
      (item) => item.key === this.state.selectedItems[0]
    );

    const array = [
      ...this.props.items.slice(indexOfSelectedItem + 1),
      ...this.props.items.slice(0, indexOfSelectedItem)
    ];

    for (const item of array) {
      if (item.label.toLowerCase().startsWith(letter)) {
        const element = document.querySelector(`[data-key="${item.key}"]`);
        (element as HTMLElement)?.focus();
        this.setState({ selectedItems: [item.key] });
        return;
      }
    }
  };

  render() {
    return (
      <StyledList
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
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
            onDoubleClick={() => this.props.onItemDoubleClick?.(item.key)}
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
