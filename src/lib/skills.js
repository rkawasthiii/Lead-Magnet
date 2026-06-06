import { readFileSync } from 'fs';
import { join } from 'path';

const SKILL_NAMES = ['audit', 'copy', 'leadmagnet', 'outreach'];

export async function getSkill(supabase, userId, skillName) {
  if (!SKILL_NAMES.includes(skillName)) {
    throw new Error(`Invalid skill name: ${skillName}`);
  }

  const { data } = await supabase
    .from('skills')
    .select('content')
    .eq('user_id', userId)
    .eq('name', skillName)
    .single();

  if (data?.content) {
    return stripFrontmatter(data.content);
  }

  return getDefaultSkill(skillName);
}

function stripFrontmatter(content) {
  const match = content.match(/^---\s*\n[\s\S]*?\n---\s*\n/);
  return match ? content.slice(match[0].length) : content;
}

export function getDefaultSkill(skillName) {
  try {
    const filePath = join(process.cwd(), 'skills', `${skillName}.md`);
    return stripFrontmatter(readFileSync(filePath, 'utf-8'));
  } catch {
    throw new Error(`Default skill file not found: skills/${skillName}.md`);
  }
}

export async function seedSkillsForUser(supabase, userId) {
  const { data: existing } = await supabase
    .from('skills')
    .select('name')
    .eq('user_id', userId);

  if (existing && existing.length >= SKILL_NAMES.length) return;

  const existingNames = (existing || []).map((s) => s.name);

  for (const name of SKILL_NAMES) {
    if (existingNames.includes(name)) continue;
    try {
      const content = getDefaultSkill(name);
      await supabase.from('skills').insert({
        user_id: userId,
        name,
        content,
        is_default: true,
      });
    } catch {
      // Skill file missing — skip seeding this one
    }
  }
}
