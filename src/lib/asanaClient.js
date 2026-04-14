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

  let allTasks = [];
  let nextUrl = `${BASE_URL}/projects/${PROJECT_GID}/tasks?opt_fields=${encodeURIComponent(fields)}&limit=100`;

  while (nextUrl) {
    const data = await fetchPage(nextUrl);
    allTasks = allTasks.concat(data.data || []);
    nextUrl = data.next_page?.uri || null;
  }

  return normalizeTasks(allTasks);
}

function normalizeTasks(tasks) {
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

    return {
      id: task.gid,
      name: task.name,
      aioBuddy,
      moduleStatuses,
    };
  });
}
