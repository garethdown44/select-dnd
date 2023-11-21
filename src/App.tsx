import React from 'react';
import './App.css';
import { DragData, Item, SmartSelect } from './SmartSelect';

const words = [
  'Socks',
  'Sandals',
  'Shoes',
  'Slippers',
  'Sneakers',
  'Boots',
  'Clogs',
  'Loafers',
  'Heels',
  'Wedges'
];
const words2 = [
  'Apples',
  'Bananas',
  'Oranges',
  'Pears',
  'Grapes',
  'Peaches',
  'Plums',
  'Pineapples',
  'Mangos',
  'Watermelons'
];

const originalItems1 = Array.from({ length: 10 }, (_, i) => ({
  key: `item1-${i + 1}`,
  label: `${words[i]} ${i}`
}));

const originalItems2 = Array.from({ length: 10 }, (_, i) => ({
  key: `item2-${i + 1}`,
  label: `${words2[i]} ${i}`
}));

function App() {
  const [items, setItems] = React.useState(originalItems1);
  const [items2, setItems2] = React.useState(originalItems2);
  const [items3, setItems3] = React.useState<Item[]>([]);

  const [dragData, setDragData] = React.useState({} as DragData);

  function handleDropped(dragData: DragData) {
    if (dragData.listId === 'list-one') {
      setItems(items.filter((x) => !dragData.items.includes(x)));
    }

    if (dragData.listId === 'list-two') {
      setItems2(items2.filter((x) => !dragData.items.includes(x)));
    }

    if (dragData.listId === 'list-three') {
      setItems3(items3.filter((x) => !dragData.items.includes(x)));
    }
  }

  return (
    <div
      style={{ display: 'flex', width: '600px', justifyContent: 'space-between', padding: '40px' }}
    >
      <div>
        <div>List One</div>
        <SmartSelect
          listId="list-one"
          items={items}
          onSetItems={setItems}
          dragData={dragData}
          onSetDraggedItems={setDragData}
          onDropped={handleDropped}
        />
      </div>

      <div>
        <div>List Two</div>
        <SmartSelect
          listId="list-two"
          items={items2}
          onSetItems={setItems2}
          dragData={dragData}
          onSetDraggedItems={setDragData}
          onDropped={handleDropped}
        />
      </div>

      <div>
        <div>List Three</div>
        <SmartSelect
          listId="list-three"
          items={items3}
          onSetItems={setItems3}
          dragData={dragData}
          onSetDraggedItems={setDragData}
          onDropped={handleDropped}
        />
      </div>
    </div>
  );
}

export default App;
