import { MODULE_CONFIG, AIO_BUDDY_FIELD_GID } from '../config/modules.js';

const PAT = '2/1212068356194686/1214056328538977:f08707e168001bf874eed7e6408393c4';
const PROJECT_GID = '1214070935734743';
const BASE_URL = 'https://app.asana.com/api/1.0';

const headers = {
  Authorization: `Bearer ${PAT}`,
  Accept: 'application/json',
};

async function fetchPage(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Fetch all sections in the project and build a map of task GID → section name
async function fetchSectionMap() {
  // 1. Get all sections
  const sectionsUrl = `${BASE_URL}/projects/${PROJECT_GID}/sections?opt_fields=name&limit=100`;
  const sectionsData = await fetchPage(sectionsUrl);
  const sections = sectionsData.data || [];

  const taskSectionMap = {}; // taskGid → sectionName

  // 2. For each section, get its tasks
  for (const section of sections) {
    let nextUrl = `${BASE_URL}/sections/${section.gid}/tasks?opt_fields=gid&limit=100`;
    while (nextUrl) {
      const data = await fetchPage(nextUrl);
      for (const task of data.data || []) {
        taskSectionMap[task.gid] = section.name;
      }
      nextUrl = data.next_page?.uri || null;
    }
  }

  return taskSectionMap;
}

export async function fetchAllTasks() {
  const fields = [
    'name',
    'assignee.name',
    'custom_fields.gid',
    'custom_fields.enum_value.name',
    'custom_fields.display_value',
    'custom_fields.name',
    'custom_fields.type',
  ].join(',');

  // Fetch tasks and section mapping in parallel
  const [allTasksRaw, sectionMap] = await Promise.all([
    (async () => {
      let allTasks = [];
      let nextUrl = `${BASE_URL}/projects/${PROJECT_GID}/tasks?opt_fields=${encodeURIComponent(fields)}&limit=100`;
      while (nextUrl) {
        const data = await fetchPage(nextUrl);
        allTasks = allTasks.concat(data.data || []);
        nextUrl = data.next_page?.uri || null;
      }
      return allTasks;
    })(),
    fetchSectionMap(),
  ]);

  return normalizeTasks(allTasksRaw, sectionMap);
}

function normalizeTasks(tasks, sectionMap = {}) {
  return tasks.map(task => {
    // Build a map of fieldGid → enum value name
    const fieldMap = {};
    if (Array.isArray(task.custom_fields)) {
      for (const cf of task.custom_fields) {
        if (cf.gid) {
          // Prefer enum_value.name, fallback to display_value
          fieldMap[cf.gid] = cf.enum_value?.name ?? cf.display_value ?? null;
        }
      }
    }

    // Extract module statuses
    const moduleStatuses = {};
    for (const mod of MODULE_CONFIG) {
      moduleStatuses[mod.fieldGid] = fieldMap[mod.fieldGid] ?? null;
    }

    // Extract AIO Buddy
    const aioBuddy = fieldMap[AIO_BUDDY_FIELD_GID] ?? null;

    // Section from Asana project board
    const section = sectionMap[task.gid] ?? null;

    return {
      id: task.gid,
      name: task.name,
      aioBuddy,
      moduleStatuses,
      section,
    };
  });
}
