
import styled from 'styled-components';

const ScrollContainer = styled.div`
  &::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: rgba(40,40,40,0.85); 
    margin: 12px;
  }
  
  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #999; 
    width: 8px;    
    border-radius: 12px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #888; 
  }
`;

export default styled(ScrollContainer)(({ theme }) => ({
    flex: 1, 
    color: 'white', 
    display: 'grid',
    padding: '14px',
    gridTemplateColumns: "repeat(auto-fill, 200px)",
    gridTemplateRows: "repeat(auto-fill, 180px)",
    justifyContent: "space-between",
    gap: "20px",
    overflowY: 'scroll'
}));
