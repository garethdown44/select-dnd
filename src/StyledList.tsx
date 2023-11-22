import styled from 'styled-components';

export const StyledList = styled.ul`
  font-size: 11px;
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  width: 200px;
  max-height: 400px;
  min-height: 300px;
  height: 100px;
  overflow-y: scroll;
  background-color: white;

  .drop-cue-before {
    border-top: 2px solid red;
    border-bottom: none;
  }

  .drop-cue-after {
    border-bottom: 2px solid red;
    border-top: none;
  }
`;

export const StyledListItem = styled.li<{ $isSelected: boolean }>`
  padding: 2px;
  cursor: pointer;

  background-color: ${(props) => (props.$isSelected ? 'blue' : 'white')};
  color: ${(props) => (props.$isSelected ? 'white' : 'black')};

  border-top: ${(props) => (props.$isSelected ? '1px solid blue' : '1px solid white')};
  border-bottom: ${(props) => (props.$isSelected ? '1px solid blue' : '1px solid white')};
`;
