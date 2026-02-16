"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Group, Member, Expense } from "@/types";

interface AppState {
  groups: Group[];
}

type Action =
  | { type: "CREATE_GROUP"; payload: { name: string; members: Member[] } }
  | { type: "DELETE_GROUP"; payload: { groupId: string } }
  | {
      type: "ADD_MEMBER";
      payload: { groupId: string; member: Member };
    }
  | {
      type: "ADD_EXPENSE";
      payload: { groupId: string; expense: Expense };
    }
  | {
      type: "EDIT_EXPENSE";
      payload: { groupId: string; expense: Expense };
    }
  | {
      type: "DELETE_EXPENSE";
      payload: { groupId: string; expenseId: string };
    };

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CREATE_GROUP": {
      const newGroup: Group = {
        id: generateId(),
        name: action.payload.name,
        members: action.payload.members,
        expenses: [],
        createdAt: new Date().toISOString(),
      };
      return { ...state, groups: [...state.groups, newGroup] };
    }
    case "DELETE_GROUP":
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload.groupId),
      };
    case "ADD_MEMBER":
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? { ...g, members: [...g.members, action.payload.member] }
            : g
        ),
      };
    case "ADD_EXPENSE":
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? { ...g, expenses: [...g.expenses, action.payload.expense] }
            : g
        ),
      };
    case "EDIT_EXPENSE":
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? {
                ...g,
                expenses: g.expenses.map((e) =>
                  e.id === action.payload.expense.id
                    ? action.payload.expense
                    : e
                ),
              }
            : g
        ),
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? {
                ...g,
                expenses: g.expenses.filter(
                  (e) => e.id !== action.payload.expenseId
                ),
              }
            : g
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, { groups: [] });
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export { generateId };
