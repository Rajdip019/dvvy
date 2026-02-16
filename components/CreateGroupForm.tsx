"use client";

import { useState } from "react";
import { useApp, generateId } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Member } from "@/types";

export default function CreateGroupForm() {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  function addMember() {
    const trimmed = memberName.trim();
    if (!trimmed) return;
    setMembers((prev) => [...prev, { id: generateId(), name: trimmed }]);
    setMemberName("");
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim() || members.length < 2) return;
    dispatch({
      type: "CREATE_GROUP",
      payload: { name: groupName.trim(), members },
    });
    setGroupName("");
    setMemberName("");
    setMembers([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" className="gap-2 sm:size-lg w-full sm:w-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g. Weekend Trip"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberName">Add Members</Label>
            <div className="flex gap-2">
              <Input
                id="memberName"
                placeholder="Member name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="secondary" onClick={addMember}>
                Add
              </Button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <Badge
                  key={m.id}
                  variant="secondary"
                  className="gap-1 px-3 py-1.5 text-sm"
                >
                  {m.name}
                  <button
                    type="button"
                    onClick={() => removeMember(m.id)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {members.length < 2 && members.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Add at least 2 members to create a group.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!groupName.trim() || members.length < 2}
          >
            Create Group
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
