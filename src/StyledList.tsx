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
`;

export const StyledListItem = styled.li<{ $isSelected: boolean }>`
  padding: 2px;
  cursor: pointer;
  background-color: ${(props) => (props.$isSelected ? 'blue' : 'white')};
  color: ${(props) => (props.$isSelected ? 'white' : 'black')};
  &:last-child {
    border-bottom: none;
  }
`;
