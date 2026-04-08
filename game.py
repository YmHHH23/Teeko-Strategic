import copy
import random
import time

class TeekoPlayer:
    """ An object representation for an AI game player for the game Teeko.
    """
    pieces = ['b', 'r']
    max_depth = 3  # You may adjust this

    def __init__(self):
        """ Initializes a TeekoPlayer object by randomly selecting red or black as its
        piece color.
        """
        self.board = [[' ' for j in range(5)] for i in range(5)]
        self.my_piece = random.choice(self.pieces)
        self.opp = self.pieces[0] if self.my_piece == self.pieces[1] else self.pieces[1]

    # Check if we're in the drop phase (less than 8 pieces total)
    def is_drop_phase(self, state):
        count = 0
        for row in state:
            for cell in row:
                if cell != ' ':
                    count += 1
        return count < 8

    # Get all possible moves for the current player
    def get_all_moves(self, state, drop_phase):
        moves = []
        # In drop phase: place a piece in any empty space        
        if drop_phase:
            for i in range(5):
                for j in range(5):
                    if state[i][j] == ' ':
                        moves.append([(i, j)])
        # In move phase: move one of our pieces to adjacent empty space
        else:
            for i in range(5):
                for j in range(5):
                    if state[i][j] == self.my_piece:
                        # Check adjacent positions
                        for di in [-1, 0, 1]:
                            for dj in [-1, 0, 1]:
                                if di == 0 and dj == 0:
                                    continue
                                new_i, new_j = i + di, j + dj
                                if (0 <= new_i < 5 and 0 <= new_j < 5 and state[new_i][new_j] == ' '):
                                    moves.append([(new_i, new_j), (i, j)])
        return moves

    def make_move(self, state):
        """ 
        TODO: Selects a (row, col) space for the next move. You may assume that whenever
        this function is called, it is this player's turn to move.

        Args:
            state (list of lists): should be the current state of the game as saved in
                this TeekoPlayer object. Note that this is NOT assumed to be a copy of
                the game state and should NOT be modified within this method (use
                place_piece() instead). Any modifications (e.g. to generate successors)
                should be done on a deep copy of the state.

                In the "drop phase", the state will contain less than 8 elements which
                are not ' ' (a single space character).

        Return:
            move (list): a list of move tuples such that its format is
                    [(row, col), (source_row, source_col)]
                where the (row, col) tuple is the location to place a piece and the
                optional (source_row, source_col) tuple contains the location of the
                piece the AI plans to relocate (for moves after the drop phase). In
                the drop phase, this list should contain ONLY THE FIRST tuple.

        Note that without drop phase behavior, the AI will just keep placing new markers
            and will eventually take over the board. This is not a valid strategy and
            will earn you no points.
        """
        # Check if drop phase
        drop_phase = self.is_drop_phase(state)
        
        best_move = None
        best_value = -float('inf')
        alpha = -float('inf')
        beta = float('inf')
        
        # Generate all possible moves
        for move in self.get_all_moves(state, drop_phase):
            new_state = copy.deepcopy(state)
            
            # Apply the move to the new state
            if drop_phase:
                row, col = move[0]
                new_state[row][col] = self.my_piece
            else:
                to_row, to_col = move[0]
                from_row, from_col = move[1]
                new_state[from_row][from_col] = ' '
                new_state[to_row][to_col] = self.my_piece
            
            # Evaluate the move using minimax
            value = self.min_value(new_state, 1, alpha, beta)
            
            if value > best_value:
                best_value = value
                best_move = move
            
            alpha = max(alpha, best_value)
        
        return best_move


    def succ(self, state, piece):
        """
        TODO: Generate a list of valid successors for the current game state 
        on placing your piece. (defined by self.my_piece)
        """
        successors = []
        drop_phase = self.is_drop_phase(state)
        
        # In drop phase: place a piece in any empty space
        if drop_phase:
            for i in range(5):
                for j in range(5):
                    if state[i][j] == ' ':
                        new_state = copy.deepcopy(state)
                        new_state[i][j] = piece
                        successors.append(new_state)
        # In move phase: move one piece to adjacent empty space
        else:
            for i in range(5):
                for j in range(5):
                    if state[i][j] == piece:
                        # Check adjacent positions
                        for di in [-1, 0, 1]:
                            for dj in [-1, 0, 1]:
                                if di == 0 and dj == 0:
                                    continue
                                new_i, new_j = i + di, j + dj
                                if (0 <= new_i < 5 and 0 <= new_j < 5 and state[new_i][new_j] == ' '):
                                    new_state = copy.deepcopy(state)
                                    new_state[i][j] = ' '
                                    new_state[new_i][new_j] = piece
                                    successors.append(new_state)

        return successors
    
    def opponent_move(self, move):
        """ Validates the opponent's next move against the internal board representation.
        You don't need to touch this code.

        Args:
            move (list): a list of move tuples such that its format is
                    [(row, col), (source_row, source_col)]
                where the (row, col) tuple is the location to place a piece and the
                optional (source_row, source_col) tuple contains the location of the
                piece the AI plans to relocate (for moves after the drop phase). In
                the drop phase, this list should contain ONLY THE FIRST tuple.
        """
        # validate input
        if len(move) > 1:
            source_row = move[1][0]
            source_col = move[1][1]
            if source_row != None and self.board[source_row][source_col] != self.opp:
                self.print_board()
                print(move)
                raise Exception("You don't have a piece there!")
            if abs(source_row - move[0][0]) > 1 or abs(source_col - move[0][1]) > 1:
                self.print_board()
                print(move)
                raise Exception('Illegal move: Can only move to an adjacent space')
        if self.board[move[0][0]][move[0][1]] != ' ':
            raise Exception("Illegal move detected")
        # make move
        self.place_piece(move, self.opp)

    def place_piece(self, move, piece):
        """ Modifies the board representation using the specified move and piece

        Args:
            move (list): a list of move tuples such that its format is
                    [(row, col), (source_row, source_col)]
                where the (row, col) tuple is the location to place a piece and the
                optional (source_row, source_col) tuple contains the location of the
                piece the AI plans to relocate (for moves after the drop phase). In
                the drop phase, this list should contain ONLY THE FIRST tuple.

                This argument is assumed to have been validated before this method
                is called.
            piece (str): the piece ('b' or 'r') to place on the board
        """
        if len(move) > 1:
            self.board[move[1][0]][move[1][1]] = ' '
        self.board[move[0][0]][move[0][1]] = piece

    def print_board(self):
        """ Formatted printing for the board """
        for row in range(len(self.board)):
            line = str(row)+": "
            for cell in self.board[row]:
                line += cell + " "
            print(line)
        print("   A B C D E")


    def heuristic_game_value(self, state):
        """ 
        TODO: Define the heuristic game value of the current board state taking into account players
        and opponents

        Args:
        state (list of lists): either the current state of the game as saved in
            this TeekoPlayer object, or a generated successor state.

        Returns:
            float heuristic_val (heuristic computed for the game state)
        """
        # Check if it's a terminal state
        terminal_value = self.game_value(state)
        if terminal_value != 0:
            return float(terminal_value)
        
        # Count potential winning lines
        my_score = 0
        opp_score = 0
        
        # Check all possible winning patterns
        patterns = []
        
        # For horizontal patterns
        for row in range(5):
            for col in range(2):
                patterns.append([(row, col+i) for i in range(4)])
        
        # For vertical patterns
        for col in range(5):
            for row in range(2):
                patterns.append([(row+i, col) for i in range(4)])
        
        # For main diagonal patterns
        for row in range(2):
            for col in range(2):
                patterns.append([(row+i, col+i) for i in range(4)])
        
        # For anti-diagonal patterns
        for row in range(2):
            for col in range(3, 5):
                patterns.append([(row+i, col-i) for i in range(4)])
        
        # For 2x2 box patterns
        for row in range(4):
            for col in range(4):
                patterns.append([(row, col), (row, col+1), (row+1, col), (row+1, col+1)])
        
        # Evaluate each pattern
        for pattern in patterns:
            my_count = 0
            opp_count = 0
            empty_count = 0
            
            for (r, c) in pattern:
                if state[r][c] == self.my_piece:
                    my_count += 1
                elif state[r][c] == self.opp:
                    opp_count += 1
                else:
                    empty_count += 1
            
            # Only count patterns that can still be won
            if my_count > 0 and opp_count == 0:
                my_score += my_count * my_count
            elif opp_count > 0 and my_count == 0:
                opp_score += opp_count * opp_count
        
        # Normalize
        if my_score + opp_score == 0:
            return 0.0
        heuristic_val = (my_score - opp_score) / (my_score + opp_score)

        return heuristic_val


    def game_value(self, state):
        """ 
        TODO: Checks the current board status for a win condition

        Args:
        state (list of lists): either the current state of the game as saved in
            this TeekoPlayer object, or a generated successor state.

        Returns:
            int: 1 if this TeekoPlayer wins, -1 if the opponent wins, 0 if no winner
        """
        # For horizontal patterns
        for row in range(5):
            for col in range(2):
                first_cell = state[row][col]
                if first_cell == ' ':
                    continue
                    
                win = True
                for i in range(1, 4):
                    if state[row][col + i] != first_cell:
                        win = False
                        break
                        
                if win:
                    if first_cell == self.my_piece:
                        return 1  
                    else:
                        return -1
                
        # For vertical patterns
        for col in range(5):
            for row in range(2):
                first_cell = state[row][col]
                if first_cell == ' ':
                    continue
                    
                win = True
                for i in range(1, 4):
                    if state[row + i][col] != first_cell:
                        win = False
                        break
                        
                if win:
                    if first_cell == self.my_piece:
                        return 1  
                    else:
                        return -1

        # For main diagonal patterns
        for row in range(2):
            for col in range(2):
                first_cell = state[row][col]
                if first_cell == ' ':
                    continue
                    
                win = True
                for i in range(1, 4):
                    if state[row + i][col + i] != first_cell:
                        win = False
                        break
                        
                if win:
                    if first_cell == self.my_piece:
                        return 1  
                    else:
                        return -1

        # For anti-diagonal patterns
        for row in range(2):
            for col in range(3, 5):
                first_cell = state[row][col]
                if first_cell == ' ':
                    continue
                    
                win = True
                for i in range(1, 4):
                    if state[row + i][col - i] != first_cell:
                        win = False
                        break
                        
                if win:
                    if first_cell == self.my_piece:
                        return 1  
                    else:
                        return -1

        # For 2x2 box patterns
        for row in range(4):
            for col in range(4):
                first_cell = state[row][col]
                if first_cell == ' ':
                    continue
                    
                # Check the other three cells in the 2x2 box
                if (state[row][col + 1] == first_cell and 
                    state[row + 1][col] == first_cell and 
                    state[row + 1][col + 1] == first_cell):
                    if first_cell == self.my_piece:
                        return 1  
                    else:
                        return -1

        return 0  # no winner yet


    def max_value(self, state, depth, alpha, beta):
        """
        TODO: Complete the helper function to implement min-max as described in the writeup
        """
        # Check terminal state or depth limit
        if self.game_value(state) != 0:
            return self.game_value(state)
        
        if depth >= self.max_depth:
            return self.heuristic_game_value(state)
        
        value = -float('inf')
        for successor in self.succ(state, self.my_piece):
            value = max(value, self.min_value(successor, depth + 1, alpha, beta))
            if value >= beta:
                return value
            alpha = max(alpha, value)
        
        return value

    def min_value(self, state, depth, alpha, beta):
        """
        Helper function for implement min-max as described
        """
        # Check terminal state or depth limit
        if self.game_value(state) != 0:
            return self.game_value(state)
        
        if depth >= self.max_depth:
            return self.heuristic_game_value(state)
        
        value = float('inf')
        for successor in self.succ(state, self.opp):
            value = min(value, self.max_value(successor, depth + 1, alpha, beta))
            if value <= alpha:
                return value
            beta = min(beta, value)
        
        return value


############################################################################
#
# THE FOLLOWING CODE IS FOR SAMPLE GAMEPLAY ONLY
#
############################################################################
def main():
    print('Hello, this is Samaritan')
    ai = TeekoPlayer()
    piece_count = 0
    turn = 0

    # drop phase
    while piece_count < 8 and ai.game_value(ai.board) == 0:

        # get the player or AI's move
        if ai.my_piece == ai.pieces[turn]:
            ai.print_board()
            move = ai.make_move(ai.board)
            ai.place_piece(move, ai.my_piece)
            print(ai.my_piece+" moved at "+chr(move[0][1]+ord("A"))+str(move[0][0]))
        else:
            move_made = False
            ai.print_board()
            print(ai.opp+"'s turn")
            while not move_made:
                player_move = input("Move (e.g. B3): ")
                while player_move[0] not in "ABCDE" or player_move[1] not in "01234":
                    player_move = input("Move (e.g. B3): ")
                try:
                    ai.opponent_move([(int(player_move[1]), ord(player_move[0])-ord("A"))])
                    move_made = True
                except Exception as e:
                    print(e)

        # update the game variables
        piece_count += 1
        turn += 1
        turn %= 2

    # move phase - can't have a winner until all 8 pieces are on the board
    while ai.game_value(ai.board) == 0:

        # get the player or AI's move
        if ai.my_piece == ai.pieces[turn]:
            ai.print_board()
            move = ai.make_move(ai.board)
            ai.place_piece(move, ai.my_piece)
            print(ai.my_piece+" moved from "+chr(move[1][1]+ord("A"))+str(move[1][0]))
            print("  to "+chr(move[0][1]+ord("A"))+str(move[0][0]))
        else:
            move_made = False
            ai.print_board()
            print(ai.opp+"'s turn")
            while not move_made:
                move_from = input("Move from (e.g. B3): ")
                while move_from[0] not in "ABCDE" or move_from[1] not in "01234":
                    move_from = input("Move from (e.g. B3): ")
                move_to = input("Move to (e.g. B3): ")
                while move_to[0] not in "ABCDE" or move_to[1] not in "01234":
                    move_to = input("Move to (e.g. B3): ")
                try:
                    ai.opponent_move([(int(move_to[1]), ord(move_to[0])-ord("A")),
                                    (int(move_from[1]), ord(move_from[0])-ord("A"))])
                    move_made = True
                except Exception as e:
                    print(e)

        # update the game variables
        turn += 1
        turn %= 2

    ai.print_board()
    if ai.game_value(ai.board) == 1:
        print("AI wins! Game over.")
    else:
        print("You win! Game over.")


if __name__ == "__main__":
    main()
