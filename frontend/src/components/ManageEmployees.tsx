import { useEffect, useState, FormEvent } from 'react';
import { Button } from './ui/button';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

export interface Employee {
  employee_id: number;
  full_name: string;
  department: string;
  username: string;
}

export default function ManageEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setFullName('');
    setDepartment('');
    setEmpUsername('');
    setEmpPassword('');
    setEditingId(null);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to load employees.');
      }

      const data = await res.json();
      setEmployees(data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim() || !department.trim() || !empUsername.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);

    const payload: any = {
      full_name: fullName,
      department,
      username: empUsername,
    };

    if (!editingId) {
      payload.password = empPassword;
    } else if (empPassword.trim()) {
      payload.password = empPassword;
    }

    try {
      const url = editingId
        ? `${API_BASE}/api/employees/${editingId}`
        : `${API_BASE}/api/employees`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to save employee.');
      }

      await fetchEmployees();
      resetForm();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      setError(err.message || 'Failed to save employee.');
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.employee_id);
    setFullName(emp.full_name);
    setDepartment(emp.department || '');
    setEmpUsername(emp.username);
    setEmpPassword('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to delete employee.');
      }

      setEmployees((prev) => prev.filter((e) => e.employee_id !== id));
    } catch (err: any) {
      console.error('Error deleting employee:', err);
      setError(err.message || 'Failed to delete employee.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100 mb-1">
          Manage Employees
        </h2>
        <p className="text-sm text-slate-400">
          Add new employees or update existing employee records.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm"
            placeholder="Full Name"
          />
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm"
            placeholder="Department"
          />
          <input
            type="text"
            value={empUsername}
            onChange={(e) => setEmpUsername(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm"
            placeholder="Username"
          />
          <input
            type="password"
            value={empPassword}
            onChange={(e) => setEmpPassword(e.target.value)}
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm"
            placeholder={
              editingId ? 'New Password (optional)' : 'Password (required)'
            }
          />
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            {editingId ? 'Update Employee' : 'Add Employee'}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetForm}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Employee List</h3>
          {loading && (
            <span className="text-xs text-slate-400">Loading…</span>
          )}
        </div>

        {employees.length === 0 && !loading && (
          <p className="text-sm text-slate-400">No employees found.</p>
        )}

        {employees.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-slate-200">
              <thead>
                <tr className="border-b border-slate-700 text-xs uppercase text-slate-400">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="py-2 pr-4 text-xs text-slate-400">
                      {emp.employee_id}
                    </td>
                    <td className="py-2 pr-4">{emp.full_name}</td>
                    <td className="py-2 pr-4">{emp.department}</td>
                    <td className="py-2 pr-4">{emp.username}</td>
                    <td className="py-2 pr-4 space-x-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleEdit(emp)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleDelete(emp.employee_id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
