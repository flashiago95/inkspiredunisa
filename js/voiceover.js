/* The narrated tour: every spoken line, slide by slide, in the order it plays.
   Each line is paired with its on-screen cue in deck.js by position, so keep the order when editing.
   After changing any wording, run tools/make-voiceover.mjs again: it re-records only the lines that changed. */
window.VO_LINES={
 africa:[
  'For generations, UNISA has taught Africa at a distance.',
  'Its students learn alone, at kitchen tables and on phones, far from support, from laboratories, and from the people who will employ them.',
  'One UNISA gives that distance a front door.',
  'Three sites, each built where its region’s economy already lives, joined by one digital backbone from the main campus in Pretoria.',
  'It begins on the Cape Town waterfront.'
 ],
 vision:[
  'This is One UNISA: a connected learning ecosystem, designed by Inkspired Architects.',
  'The Hub: 5,000 square metres for marine studies and the blue economy.',
  'In Mahikeng, the Centre: 2,200 square metres for mining and geoscience, built where the economy already lives.',
  'And in Mthatha, the Spoke: 700 square metres for pharmaceutical and health studies, a short walk from the community it serves.',
  'Three connected sites. 7,900 square metres. Three regional niches. One design language and one digital backbone.'
 ],
 question:[
  'Which brings us to the question for this board. What if that distance had a front door?',
  'The first gap is support. Distance students study at kitchen tables and on phones. When they fall behind, nobody sees it until results are published.',
  'The second gap is research. Marine science, geoscience and pharmacy need equipment, data and supervision that a screen alone cannot provide.',
  'The third gap is industry. Employers, ports, mines and clinics need somewhere to meet the graduates they will hire, and the research they will fund.'
 ],
 model:[
  'Our answer is One UNISA: three sites, one system. Each site anchors a niche its region already lives by.',
  'The Hub in Cape Town is the flagship and network anchor, at 5,000 square metres.',
  'The Centre in Mahikeng is a regional knowledge centre of 2,200 square metres.',
  'The Spoke in Mthatha is a community access point of 700 square metres.',
  'Each site is sized to the community it serves, and all three plug into one digital backbone, run from the main campus in Pretoria.'
 ],
 journey:[
  'The buildings exist to deliver a service model. Follow one student through eight stages, and watch the system act before the student has to ask.',
  'Discover. A new student asks: where do I go now? Enrolment triggers a welcome in their own language, with the nearest site and a bookable orientation slot.',
  'Arrive. Smart access recognises the booking, and self-help kiosks free staff to focus on the student in front of them.',
  'Support. When a student misses submissions or goes quiet online, an early alert is raised, and an adviser books a consultation before the student asks.',
  'Learn. The app suggests a free seat or study room near the student’s next session, with power and data at every seat.',
  'Collaborate. Hybrid studios join group members across four provinces, with tracking cameras, live captions and recording built in.',
  'Research. Postgraduates are matched to lab time, datasets and supervisors, and progress is visible to both sides.',
  'Connect. Industry partners post live challenges through the incubator, and students pitch for partner projects.',
  'And belong. Public lectures and alumni mentoring keep graduates connected to the next intake.',
  'Confidence rises at every stage, and every stage has a number the university can track.'
 ],
 sites:[
  'Every square metre has a job. The Hub sits on the Cape Town waterfront: four levels, anchored in marine studies and the blue economy.',
  'Students arrive into a lobby with a multilingual welcome wall, self-help kiosks and smart access.',
  'Hybrid studios bring remote peers into the room, with tracking cameras and live captions.',
  'And an operations centre monitors space use and energy across the building.',
  'The Centre in Mahikeng rises over two levels, behind a facade patterned on the regional landscape.',
  'Inside, Sol Plaatje artwork forms the civic welcome, and a collaboration studio reconfigures into four layouts.',
  'The Spoke in Mthatha is a single level, with language choice at the welcome screen and live expert support from across the network.',
  'Its community forecourt takes learning outdoors, under a shaded canopy.'
 ],
 brief:[
  'The brief is specific enough to cost. At the Hub, eleven named zones account for 4,530 of the 5,000 square metres.',
  'The largest is the marine learning commons, at 800 square metres.',
  'The zoning plans show where every zone sits, floor by floor.',
  'At the Centre, eight zones account for 1,730 square metres, led by the learning commons and digital laboratories.',
  'At the Spoke, five zones account for 625 square metres.',
  'At every site, the balance for circulation and services is declared openly, and will be confirmed in detailed design.'
 ],
 capital:[
  'Now, the case for capital. Design once, deploy many, and release capital against evidence.',
  'Across the three sites, 6,885 of the 7,900 stated square metres are already allocated to named functions. That is 87% allocation efficiency.',
  'The space mix shows how each site balances learning, research, student support and administration.',
  'And the same modules repeat at every scale, so furniture, technology, wayfinding and finishes are specified once and procured across the network.'
 ],
 levers:[
  'Three levers make the case, and each one comes with a measure, with targets set in the business case.',
  'First, lower cost and delivery risk. One specification and repeat procurement, with lessons from the Hub priced into the Centre and the Spoke.',
  'Second, space that earns its keep. Every room is bookable, every booking is measured, and energy is tracked per square metre.',
  'Third, new partnership income: a blue economy incubator, hybrid conferencing, and public lectures and community programmes.'
 ],
 gates:[
  'Funding is released gate by gate, and each gate is a board decision. Gate one is today: endorse the One UNISA model, and the Hub as the first site.',
  'Gate two delivers the detailed design and the business case.',
  'Gate three releases construction funding for the Hub, but only against an approved business case.',
  'Gate four approves the Centre in Mahikeng, once Hub utilisation data proves the model.',
  'And gate five brings the Spoke in Mthatha, then further Spokes from the same kit of parts.',
  'We also name the risks, from cost overrun and low utilisation to ageing technology and weak local relevance, and how the model responds to each.'
 ],
 ask:[
  'So, the decision we request. Approve funding to take the Hub through detailed design and a full business case.',
  'This is the first gated phase of One UNISA. It commits the university to evidence, not to construction.',
  'It returns to this board with three things: a priced cost plan, an enrolment and utilisation model, and partners on paper.'
 ],
 gallery:[
  'Finally, see it for yourself. Twenty concept renders from revision B, ready to filter by site or by type of space.',
  'Thank you.'
 ]
};

/* How names are said. Captions keep the written form; only the voice uses these.
   Each rule is [pattern, flags, replacement] and applies word by word. */
window.VO_PRON=[
 ['\\bUNISA\\b','g','Unisa'],
 ['Mthatha','g','Umtata'],
 ['Plaatje','g','Plaakyee'],
 ['self-help','g','self help'],
 ['(\\d)%','g','$1 percent']
];
