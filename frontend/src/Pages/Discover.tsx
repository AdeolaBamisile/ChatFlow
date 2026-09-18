import { useMemo, useState } from "react";

import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client/react";

import { Search } from "lucide-react";

import FilterButton from "../Components/Discover&RequestsSpecific/FilterButton";
import DiscoverIndex from "../Components/Discover&RequestsSpecific/UserCard/DiscoverIndex";

import {
  DISCOVER_USERS_QUERY,
  SEND_FRIEND_REQUEST_MUTATION,
  FRIEND_REQUEST_SUBSCRIPTION,
} from "../services/graphql";

import type { User } from "../types";

type DiscoverUser = User & { mutualFriends: number };

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const client = useApolloClient();

  const { data, loading, error } = useQuery<{ discoverUsers: DiscoverUser[] }>(
    DISCOVER_USERS_QUERY,
    { variables: { search: search || null, category: activeCategory } },
  );

  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [
      {
        query: DISCOVER_USERS_QUERY,
        variables: { search: search || null, category: activeCategory },
      },
    ],
  });

  useSubscription(FRIEND_REQUEST_SUBSCRIPTION, {
    onData: () => {
      void client.refetchQueries({ include: [DISCOVER_USERS_QUERY] });
    },
  });

  const users = data?.discoverUsers ?? [];

  const visibleUsers = useMemo(
    () =>
      users.filter((user) => {
        const term = search.trim().toLowerCase();

        const matchesSearch =
          !term ||
          user.name.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          user.bio.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (activeCategory === "Mutuals") {
          return user.mutualFriends > 0;
        }
        if (activeCategory === "New Users") {
          return user.mutualFriends === 0;
        }

        return true;
      }),
    [search, users, activeCategory],
  );

  const categories = ["All", "Mutuals", "New Users"];

  const SKELETON_COUNT = 12;

  return (
    <div className="discover-page">
      <main className={`discover-content ${loading ? "is-loading" : ""}`}>
        <header className="discover-header">
          <div className="discover-title">
            <h1>Discover</h1>
            <p>Find new people and connect</p>
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
          {loading && (
            <div className="users-grid">
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <div className="loading-card" key={index}>
                  <div className="moving-beam" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="empty-state">Unable to load users.</p>
          )}

          {!loading && !visibleUsers.length && (
            <p className="empty-state">No users found.</p>
          )}

          <div className="users-grid">
            {visibleUsers.map((user) => (
              <DiscoverIndex
                key={user.id}
                user={{ ...user, request: undefined }}
                handleAddFriend={() =>
                  void sendFriendRequest({ variables: { userId: user.id } })
                }
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Discover;
