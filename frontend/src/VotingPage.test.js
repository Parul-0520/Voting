import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';

test('renders voting options and handles clicks', async () => {
  await act(async () => {
    render(
      <BrowserRouter>
        <AdminPanel
          votes={[
            { _id: '1', option: 'Emma', votes: 4, category: 'Female Head' },
            { _id: '2', option: 'Joyce', votes: 0, category: 'Female Head' }
          ]}
          setVotes={jest.fn()}
          showNotification={jest.fn()}
          fetchVotes={jest.fn()}
        />
      </BrowserRouter>
    );
  });

 const candidates = screen.getAllByText(/Emma/i);
expect(candidates.length).toBeGreaterThan(0);

  const showVotersBtn = screen.getAllByText(/Show Voters/i)[0];
  expect(showVotersBtn).toBeInTheDocument();

  const deleteBtn = screen.getAllByText(/Delete/i)[0];
  fireEvent.click(deleteBtn);
});