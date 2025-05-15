const ProjectListView = ({ projects }) => (
  <table className="">
    <thead>
      <tr className="bg-gray-100">
        <th className="border px-4 py-2">Title</th>
        <th className="border px-4 py-2">Status</th>
        <th className="border px-4 py-2">Created</th>
        <th className="border px-4 py-2">Deadline</th>
        <th className="border px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {projects.map((p) => (
        <tr key={p.project_id}>
          <td className="border px-4 py-2">{p.project_name}</td>
          <td className="border px-4 py-2">{p.status}</td>
          <td className="border px-4 py-2">{p.project_created_at || "-"}</td>
          <td className="border px-4 py-2">{p.deadline || "-"}</td>
          <td className="border px-4 py-2">[Edit/Delete]</td>
        </tr>
      ))}
    </tbody>
  </table>
);
export default ProjectListView;
