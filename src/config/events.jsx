import React from 'react';
import {
  Presentation,
  Coins,
  MessageSquare,
  Terminal,
  Code2,
  Gamepad2,
  Gamepad,
  UserCheck,
  DoorOpen,
  Mic2
} from 'lucide-react';

export const EVENT_SCHEDULE = {
  technova: {
    title: 'Paper Symposium',
    session: 'FULL_DAY',
    venue: 'Auditorium',
  },
  coderelay: {
    title: 'Relay Coding',
    session: 'MORNING',
    venue: 'NH1',
  },
  funfiesta: {
    title: 'Carnival Games',
    session: 'MORNING',
    venue: 'NH2',
  },
  listenlink: {
    title: 'Guess the Hacker',
    session: 'MORNING',
    venue: 'NH3',
  },
  bytebattles: {
    title: 'Tech Debate',
    session: 'MORNING',
    venue: 'NH4',
  },
  cyberarena: {
    title: 'E-Sports',
    session: 'FULL_DAY',
    venue: 'NH5',
  },
  hackonomics: {
    title: 'Mystery Box',
    session: 'EVENING',
    venue: 'NH1',
  },
  aiwhisperer: {
    title: 'Prompt Engineering Battle',
    session: 'EVENING',
    venue: 'NH2',
  },
  corporatequest: {
    title: 'HR Interview',
    session: 'EVENING',
    venue: 'NH3',
  },
  chaosroom: {
    title: 'Chaos Room',
    session: 'EVENING',
    venue: 'NH4',
  },
};

export const TECHNICAL_EVENTS = [
  {
    id: 'technova',
    subtitle: 'Paper Presentation',
    hook: 'Showcase your research on modern tech.',
    description: 'A formal academic presentation platform. Students submit abstracts on modern technological advancements. Shortlisted participants present their research papers using slide decks to a panel of judges. Evaluated on: relevance of topic, depth of research, presentation skills, and ability to defend their work during Q&A.',
    placeholders: { teamSize: '1-2 members', duration: '15-20 mins', venue: 'Auditorium', rules: 'Follow IEEE format' },
    icon: <Presentation className="w-6 h-6" />,
  },
  {
    id: 'hackonomics',
    subtitle: 'The Bidding Quiz',
    hook: 'Tech knowledge meets resource strategy.',
    description: 'A technical quiz combined with resource management and strategy. Each team starts with a set amount of "fake currency." Teams are given complex technical questions or scenarios, and if stuck, can "buy" clues/hints from coordinators using their fake money. Winning criteria: final score combines speed/accuracy of correct answers with remaining fake-currency balance.',
    placeholders: { teamSize: '2 members', duration: '1 hour', venue: 'NH1', rules: 'Bidding logic applies' },
    icon: <Coins className="w-6 h-6" />,
  },
  {
    id: 'bytebattles',
    subtitle: 'Tech Debate',
    hook: 'Argue the future of technology.',
    description: 'A debate competition focused purely on the tech industry. Two teams debate current technical topics (e.g., "AI Replacing Software Engineers" or "Open Source vs. Proprietary Software") with set times for opening statements, rebuttals, and closing arguments. Evaluated on: technical accuracy, logical reasoning, and communication skills.',
    placeholders: { teamSize: '2 per team', duration: '30 mins', venue: 'NH4', rules: 'Debate format applies' },
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    id: 'aiwhisperer',
    subtitle: 'Prompt Engineering Battle',
    hook: 'The art of communicating with AI.',
    description: 'A test of interacting with generative AI. Participants are shown a highly complex target — a specific AI-generated image or a tailored script. They must write the most precise prompt into an AI tool to replicate the target as closely as possible. Evaluated on: accuracy of match to the target, achieved in the fewest prompt iterations.',
    placeholders: { teamSize: 'Solo', duration: '45 mins', venue: 'NH2', rules: 'Specified LLM usage only' },
    icon: <Terminal className="w-6 h-6" />,
  },
  {
    id: 'coderelay',
    subtitle: 'Tag-Team Coding',
    hook: 'Collaborate without speaking.',
    description: 'A team-based coding challenge testing adaptability and code readability. Teams of 3–4 tackle a single complex software problem in relay fashion: Member 1 codes for 10 minutes then steps away; Member 2 must read, understand, and continue the code with no verbal communication from Member 1. Rotation continues until the program is complete.',
    placeholders: { teamSize: '3-4 members', duration: '1 hour', venue: 'NH1', rules: 'Strict no-communication' },
    icon: <Code2 className="w-6 h-6" />,
  },
];

export const NON_TECHNICAL_EVENTS = [
  {
    id: 'cyberarena',
    subtitle: 'E-Sports Tournament',
    hook: 'Battle for gaming glory.',
    description: 'A multiplayer video game tournament. Teams compete in popular mobile/PC games (e.g., BGMI, Valorant) in a bracket-style knockout format, with matches live-streamed or cast on a projector for the audience.',
    placeholders: { teamSize: 'Squad size', duration: 'TBD', venue: 'NH5', rules: 'Standard tournament rules' },
    icon: <Gamepad2 className="w-6 h-6" />,
  },
  {
    id: 'funfiesta',
    subtitle: 'Carnival Games',
    hook: 'Quick thrills and carnival games.',
    description: 'Quick, engaging mini-games to keep the crowd entertained between major events. A collection of small stalls featuring 1-minute challenges like ring toss, cup stacking, balloon darts, and wire-loop games.',
    placeholders: { teamSize: 'Solo/Group', duration: '1-5 mins', venue: 'NH2', rules: 'Fair play applies' },
    icon: <Gamepad className="w-6 h-6" />,
  },
  {
    id: 'corporatequest',
    subtitle: 'Mock HR Interview',
    hook: 'Master the corporate hiring game.',
    description: 'A placement-training simulation replicating a corporate hiring drive across three knockout rounds: Round 1 — General Aptitude and Logic test; Round 2 — Group Discussion (GD) on a given topic testing leadership and communication; Round 3 — One-on-one personal HR interview focused on situational questions and resume building.',
    placeholders: { teamSize: 'Solo', duration: 'TBD', venue: 'NH3', rules: 'Professional attire required' },
    icon: <UserCheck className="w-6 h-6" />,
  },
  {
    id: 'chaosroom',
    subtitle: 'Puzzle Escape',
    hook: 'Escape the chaos using your wits.',
    description: 'A stress-management puzzle room. A team is locked in a room filled with riddles, hidden keys, and puzzles, made harder by "chaotic" elements — distracting lights, loud ticking clocks, volunteers tossing soft obstacles. The team must stay focused, solve the puzzles, and "escape" before the timer hits zero.',
    placeholders: { teamSize: '2-4 members', duration: '30 mins', venue: 'NH4', rules: 'No force allowed' },
    icon: <DoorOpen className="w-6 h-6" />,
  },
  {
    id: 'listenlink',
    subtitle: 'Talk + Quiz',
    hook: 'Test your focus and memory.',
    description: 'A test of active listening and memory retention. A speaker delivers a fast-paced, highly informative 5-minute talk on a random topic. Immediately after, participants face a rapid-fire quiz based strictly on the details, numbers, and facts mentioned during the talk.',
    placeholders: { teamSize: 'Solo', duration: '15 mins', venue: 'NH3', rules: 'No note-taking' },
    icon: <Mic2 className="w-6 h-6" />,
  },
];
