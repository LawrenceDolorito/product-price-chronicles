
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const UserSearchBar = ({ searchQuery, setSearchQuery }: UserSearchBarProps) => {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Search Users</CardTitle>
        <CardDescription>
          Find users by name or email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearchBar;
