import { useState } from "react";

import { Search } from "lucide-react";

import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client/react";

import FilterButton from "../Components/Discover&RequestsSpecific/FilterButton";
import UserCard from "../Components/Discover&RequestsSpecific/UserCard/RequestsIndex";

import {
  ACCEPT_FRIEND_REQUEST_MUTATION,
  CHATS_QUERY,
  FRIEND_REQUESTS_QUERY,
  FRIEND_REQUEST_SUBSCRIPTION,
  IGNORE_FRIEND_REQUEST_MUTATION,
  REMOVE_FRIEND_REQUEST_MUTATION,
} from "../services/graphql";

import type { FriendRequest } from "../types";

const Requests = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const client = useApolloClient();

  const status =
    activeCategory === "Sent"
      ? "sent"
      : activeCategory === "Received"
        ? "received"
        : null;

  const { data, loading, error } = useQuery<{
    friendRequests: FriendRequest[];
  }>(FRIEND_REQUESTS_QUERY, { variables: { status } });

  const [accept] = useMutation(ACCEPT_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [
      { query: FRIEND_REQUESTS_QUERY, variables: { status } },
      { query: CHATS_QUERY },
    ],
  });

  const [ignore] = useMutation(IGNORE_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [{ query: FRIEND_REQUESTS_QUERY, variables: { status } }],
  });

  const [remove] = useMutation(REMOVE_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [{ query: FRIEND_REQUESTS_QUERY, variables: { status } }],
  });

  useSubscription(FRIEND_REQUEST_SUBSCRIPTION, {
    onData: () => {
      void client.refetchQueries({ include: [FRIEND_REQUESTS_QUERY] });
    },
  });

  const users = (data?.friendRequests ?? []).filter((user) => {
    const term = search.trim().toLowerCase();

    return (
      !term ||
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.bio.toLowerCase().includes(term)
    );
  });

  const categories = ["All", "Sent", "Received"];

  const handleAction = async (user: FriendRequest) => {
    if (user.status === "received")
      await accept({ variables: { requestId: user.id } });
    else await remove({ variables: { requestId: user.id } });
  };

  const handleIgnore = async (user: FriendRequest) => {
    await ignore({ variables: { requestId: user.id } });
  };

  return (
    <div className="discover-page">
      <main className="discover-content">
        <header className="discover-header">
          <div className="discover-title">
            <h1>Requests</h1>
            <p>Manage your friend requests</p>
          </div>

          <div className="discover-search">
            <Search size={25} strokeWidth={1.8} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name, username or interests..."
            />
          </div>
        </header>

        <div className="category-list">
          {categories.map((category) => (
            <FilterButton
              key={category}
              category={category}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          ))}
        </div>

        <section className="users-container">
          <div className="users-grid">
            {loading && <p className="empty-state">Loading requests...</p>}

            {error && <p className="empty-state">Unable to load requests.</p>}

            {!loading && !users.length && (
              <p className="empty-state">No requests here.</p>
            )}

            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                addFriend={handleAction}
                onIgnore={user.status === "received" ? handleIgnore : undefined}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Requests;
