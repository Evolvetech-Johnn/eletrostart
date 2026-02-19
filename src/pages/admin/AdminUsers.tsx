import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  UserPlus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import { adminService, AdminUser } from "../../services/adminService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

type AdminUsersData = Awaited<ReturnType<typeof adminService.getUsers>>;

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const { loading, isAuthenticated } = useAuth();

  const {
    data: users,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<AdminUsersData>({
    queryKey: ["admin-users"],
    queryFn: () => adminService.getUsers(),
    enabled: !loading && isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      toast.success("Usuário criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
    },
    onError: () => {
      toast.error("Erro ao criar usuário");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      id,
      role,
    }: {
      id: string;
      role: "ADMIN" | "MANAGER" | "EDITOR";
    }) => adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permissões atualizadas");
    },
    onError: () => {
      toast.error("Erro ao atualizar permissões");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updateUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status atualizado");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () =>
      adminService.resetPassword({
        email: resetEmail,
        newPassword: resetPassword,
        token: "ADMIN_PANEL_RESET",
      }),
    onSuccess: () => {
      toast.success("Senha redefinida");
      setResetEmail("");
      setResetPassword("");
    },
    onError: () => {
      toast.error("Erro ao redefinir senha");
    },
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as "ADMIN" | "MANAGER" | "EDITOR",
    active: true,
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createForm);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Usuários e Permissões
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie administradores, papéis e acesso ao painel.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            Erro ao carregar usuários.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Nome
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      E-mail
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Papel
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {user.name || "Sem nome"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={user.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              id: user.id,
                              role: (e.target as HTMLSelectElement).value as
                                | "ADMIN"
                                | "MANAGER"
                                | "EDITOR",
                            })
                          }
                          options={[
                            { label: "Admin", value: "ADMIN" },
                            { label: "Manager", value: "MANAGER" },
                            { label: "Editor", value: "EDITOR" },
                          ]}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: user.id,
                              active: !user.active,
                            })
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.active ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setResetEmail(user.email)}
                          className="text-xs text-primary hover:underline"
                        >
                          Resetar senha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Reset de senha rápido
          </h2>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              resetPasswordMutation.mutate();
            }}
          >
            <Input
              type="email"
              placeholder="E-mail do usuário"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Nova senha segura"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
            <Button type="submit" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Redefinir senha
            </Button>
          </form>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-semibold">Novo Usuário Admin</h2>
              <form className="space-y-3" onSubmit={handleCreateSubmit}>
                <Input
                  placeholder="Nome"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                />
                <Select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      role: (e.target as HTMLSelectElement).value as
                        | "ADMIN"
                        | "MANAGER"
                        | "EDITOR",
                    })
                  }
                  options={[
                    { label: "Admin", value: "ADMIN" },
                    { label: "Manager", value: "MANAGER" },
                    { label: "Editor", value: "EDITOR" },
                  ]}
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
