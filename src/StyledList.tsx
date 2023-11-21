import styled from 'styled-components';

export const StyledList = styled.ul`
  font-size: 11px;
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  width: 200px;
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  border-radius: 4px;
`;

export const StyledListItem = styled.li<{ $isSelected: boolean }>`
  padding: 2px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
  background-color: ${(props) => (props.$isSelected ? 'blue' : 'white')};
  color: ${(props) => (props.$isSelected ? 'white' : 'black')};
  /* &:hover {
    background-color: #ddd;
  } */
  &:last-child {
    border-bottom: none;
  }
`;
