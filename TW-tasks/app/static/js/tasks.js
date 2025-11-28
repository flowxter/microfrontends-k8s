// Wrapper para llamadas API
async function api(path, opts) {
  try {
    const res = await fetch(path, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("API Error:", err);
      throw err;
    }
    return res.status === 204 ? null : res.json();
  } catch (e) {
    console.error("[API] Error general:", e);
    throw e;
  }
}

let editingTaskId = null;

// Cargar tareas en pantalla
async function load() {
  try {
    const list = document.getElementById("tasks");
    list.innerHTML = "";

    const tasks = await api("/api/tasks");

    tasks.forEach((t) => {
      const li = document.createElement("li");
      li.className = "task";

      const title = document.createElement("span");
      title.textContent = t.title + (t.done ? " ✅" : "");
      li.appendChild(title);

      const btnDone = document.createElement("button");
      btnDone.textContent = t.done ? "Desmarcar" : "Hecho";
      btnDone.onclick = async () => {
        await api("/api/tasks/" + t.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ done: !t.done }),
        });
        load();
      };
      li.appendChild(btnDone);

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Editar";
      btnEdit.onclick = () => openEditModal(t);
      li.appendChild(btnEdit);

      const btnDel = document.createElement("button");
      btnDel.textContent = "Borrar";
      btnDel.onclick = async () => {
        await api("/api/tasks/" + t.id, { method: "DELETE" });
        load();
      };
      li.appendChild(btnDel);

      list.appendChild(li);
    });
  } catch (e) {
    console.error("Error cargando tareas:", e);
  }
}

// Modal de edición
function openEditModal(task) {
  editingTaskId = task.id;
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value =
    task.description || "";
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  editingTaskId = null;
}

// Guardar cambios
document.getElementById("saveEdit").onclick = async () => {
  const newTitle = document.getElementById("editTitle").value.trim();
  const newDescription = document
    .getElementById("editDescription")
    .value.trim();

  if (!newTitle) return;

  await api("/api/tasks/" + editingTaskId, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle,
      description: newDescription,
    }),
  });

  closeEditModal();
  load();
};

// Cancelar edición
document.getElementById("cancelEdit").onclick = closeEditModal;

// Crear nueva tarea
document
  .getElementById("taskForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document
      .getElementById("description")
      .value.trim();

    if (!title) return;

    await api("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    load();
  });

// Inicializar
load();
