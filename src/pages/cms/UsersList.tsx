import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit, Loader2, Plus, Trash2, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CombinedUser {
  user_id: string;
  role: string;
  display_name: string | null;
  email: string | null;
}

export default function UsersList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<CombinedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Role Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("viewer");

  // Add User Dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Delete Dialog
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [rolesRes, profilesRes] = await Promise.all([
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("profiles").select("user_id, display_name, email"),
    ]);

    const rolesList = rolesRes.data || [];
    const profilesList = profilesRes.data || [];

    // Merge: role table is primary, profile data is enrichment
    const merged: CombinedUser[] = rolesList.map((r) => {
      const profile = profilesList.find((p) => p.user_id === r.user_id);
      return {
        user_id: r.user_id,
        role: r.role,
        display_name: profile?.display_name ?? null,
        email: profile?.email ?? null,
      };
    });

    // Also add profiles not in user_roles (so they still appear with default viewer role)
    profilesList.forEach((p) => {
      if (!merged.find((m) => m.user_id === p.user_id)) {
        merged.push({
          user_id: p.user_id,
          role: "viewer",
          display_name: p.display_name,
          email: p.email,
        });
      }
    });

    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const currentUser = users.find((u) => u.user_id === user?.id);
  const isSuperAdmin = currentUser?.role === "admin";

  const openRoleDialog = (userId: string, currentRole: string) => {
    setEditUserId(userId);
    setSelectedRole(currentRole);
    setDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!editUserId) return;
    setSaving(true);
    try {
      const existing = users.find((u) => u.user_id === editUserId && u.role !== "viewer");
      // Check if user_roles row already exists
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", editUserId)
        .maybeSingle();

      if (roleRow) {
        const { error } = await supabase.from("user_roles").update({ role: selectedRole as any }).eq("user_id", editUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: editUserId, role: selectedRole as any });
        if (error) throw error;
      }

      setUsers(prev => prev.map(u => u.user_id === editUserId ? { ...u, role: selectedRole } : u));
      toast.success("Role updated");
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return toast.error("Email and password are required");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "create", email: newEmail, password: newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await fetchData();
      toast.success("User created successfully");
      setAddOpen(false);
      setNewEmail("");
      setNewPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "delete", targetUserId: deleteUserId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await fetchData();
      toast.success("User deleted");
      setDeleteUserId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        {isSuperAdmin && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              {isSuperAdmin && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={isSuperAdmin ? 4 : 3} className="text-center text-muted-foreground">No users found</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                      {u.display_name || <span className="text-muted-foreground italic">No name</span>}
                      {u.user_id === user?.id && <Badge variant="outline" className="text-xs ml-1">You</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email || <span className="italic">—</span>}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        <Button variant="ghost-icon" size="icon" className="h-8 w-8" title="Edit role" onClick={() => openRoleDialog(u.user_id, u.role)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {u.user_id !== user?.id && (
                          <Button variant="ghost-icon" size="icon" className="h-8 w-8 text-destructive" title="Delete user" onClick={() => setDeleteUserId(u.user_id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" autoComplete="off" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user's account, role, and profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
