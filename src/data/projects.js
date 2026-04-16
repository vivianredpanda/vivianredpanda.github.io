export const FALLBACK_PROJECTS = [
  {
    id: 1,
    name: 'vivianredpanda.github.io',
    description: 'My personal website — a cozy interactive room.',
    html_url: 'https://github.com/vivianredpanda/vivianredpanda.github.io',
    language: 'JavaScript',
  },
];

export async function fetchProjects() {
  const res = await fetch(
    'https://api.github.com/users/vivianredpanda/repos?sort=updated&per_page=12'
  );
  if (!res.ok) throw new Error('GitHub API error');
  const data = await res.json();
  return data.filter(repo => !repo.fork && !repo.archived);
}
