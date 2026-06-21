"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { getAllUsers, updateUserRole } from "@/actions/admin.actions";
import { ROLES } from "@/lib/constants";
import { toast } from "sonner";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  trustScore: number;
  totalEarnings: number;
  createdAt: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then((data) => setUsers(data as unknown as UserItem[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      toast.success("Role berhasil diupdate");
      setEditingRole(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate role");
    }
  };

  const filtered = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <p className="text-[#8888aa]">Kelola semua pengguna platform.</p>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888aa]" />
        <input
          placeholder="Cari user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#2a2a50] bg-[#111128] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#8888aa] focus:border-[#6c63ff] focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6c63ff]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#8888aa]">
          <p className="text-lg">Tidak ada user ditemukan.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2a2a50] bg-[#111128]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#2a2a50]">
                <tr className="text-left text-xs font-medium text-[#8888aa]">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Trust Score</th>
                  <th className="px-6 py-4">Earnings</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[#2a2a50]/50 text-sm hover:bg-[#1e1e3f]/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6c63ff] to-[#3b82f6] text-xs font-bold text-white">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-[#8888aa]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingRole === u.id ? (
                        <select
                          defaultValue={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          onBlur={() => setEditingRole(null)}
                          className="rounded-lg border border-[#2a2a50] bg-[#0d0d22] px-2 py-1 text-xs text-white focus:border-[#6c63ff] focus:outline-none"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingRole(u.id)}
                          className="rounded-full bg-[#6c63ff]/10 px-2.5 py-0.5 text-xs font-medium text-[#6c63ff] hover:bg-[#6c63ff]/20"
                        >
                          {u.role}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white">{u.trustScore}</td>
                    <td className="px-6 py-4 text-[#10b981]">{formatCurrency(u.totalEarnings)}</td>
                    <td className="px-6 py-4 text-[#8888aa]">{timeAgo(new Date(u.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
