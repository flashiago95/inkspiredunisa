/* The narrated tour: eleven recorded sections in vo/, one MP3 each.
   VO_TRACKS is each recording's timing table: every line's start and end time in seconds, and its words.
   VO_PLAN places the recorded lines on the deck's slides, in the order they play, as [recording, line number].
   A line can play on a different slide from the rest of its recording: the last line of "sites" plays on the brief,
   and "capital" is spread across the capital, levers and gates slides.
   If a recording is re-made, update its times here so the captions and visual cues stay in step. */
window.VO_TRACKS={
 "opening": {
  "dur": 31.5,
  "lines": [
   [
    0.35,
    4.447,
    "For generations, UNISA has taught Africa at a distance."
   ],
   [
    4.897,
    13.86,
    "Its students learn alone, at kitchen tables and on phones, far from support, from laboratories, and from the people who will employ them."
   ],
   [
    14.31,
    17.771,
    "UNISA Global gives that distance a front door."
   ],
   [
    18.221,
    27.692,
    "Three sites, each built where its region's economy already lives, joined by one digital backbone from the main campus in Pretoria."
   ],
   [
    28.142,
    31.05,
    "It begins on the Cape Town waterfront."
   ]
  ]
 },
 "vision": {
  "dur": 14.3,
  "lines": [
   [
    0.35,
    4.683,
    "The Hub in Cape Town, for marine studies and the blue economy."
   ],
   [
    5.133,
    9.041,
    "The Centre in Mahikeng, for mining and geoscience."
   ],
   [
    9.491,
    13.845,
    "And the Spoke in Mthatha, for pharmaceutical and health studies."
   ]
  ]
 },
 "network": {
  "dur": 16.32,
  "lines": [
   [
    0.35,
    6.775,
    "Together, seven thousand nine hundred square metres of learning, research and partnership space."
   ],
   [
    7.225,
    15.872,
    "Five thousand at the Hub, two thousand two hundred at the Centre, and seven hundred at the Spoke, each sized to the community it serves."
   ]
  ]
 },
 "preface": {
  "dur": 18.38,
  "lines": [
   [
    0.35,
    4.259,
    "In the words of UNISA's Principal and Vice-Chancellor."
   ],
   [
    4.709,
    13.819,
    "UNISA Global represents such a moment of reimagination. It is not a departure from UNISA's identity, but a deepening of it."
   ],
   [
    14.269,
    17.928,
    "This proposal gives that vision a physical form."
   ]
  ]
 },
 "question": {
  "dur": 12.41,
  "lines": [
   [
    0.35,
    4.27,
    "What our students lack is not content. It is a place."
   ],
   [
    4.72,
    11.957,
    "A place to be supported, to do research that needs a laboratory, and to meet the industries that will employ them."
   ]
  ]
 },
 "model": {
  "dur": 19.02,
  "lines": [
   [
    0.35,
    4.896,
    "Each site anchors an economy its region already lives by."
   ],
   [
    5.346,
    12.938,
    "The ocean economy in Cape Town. Mining and geoscience in Mahikeng. Health sciences in Mthatha."
   ],
   [
    13.388,
    18.572,
    "One design language, and one digital backbone run from the main campus."
   ]
  ]
 },
 "journey": {
  "dur": 28.5,
  "lines": [
   [
    0.35,
    4.485,
    "Every space serves a student journey that reaches out first."
   ],
   [
    4.935,
    7.532,
    "Arrive, and the student is expected."
   ],
   [
    7.982,
    12.008,
    "Fall behind, and an adviser reaches out before they ask."
   ],
   [
    12.458,
    16.732,
    "Learn, collaborate and research in spaces booked in seconds."
   ],
   [
    17.182,
    20.053,
    "Connect with the partners who will employ them."
   ],
   [
    20.503,
    28.05,
    "And belong, returning as mentors to the next intake. Every stage has a number the university can track."
   ]
  ]
 },
 "sites": {
  "dur": 19.65,
  "lines": [
   [
    0.35,
    6.028,
    "The Hub is the flagship. Five thousand square metres on the Cape Town waterfront."
   ],
   [
    6.478,
    10.334,
    "The Centre brings the same standard inland, to Mahikeng."
   ],
   [
    10.784,
    15.034,
    "The Spoke takes UNISA into the community in Mthatha."
   ],
   [
    15.484,
    19.195,
    "In every brief, each square metre has a named purpose."
   ]
  ]
 },
 "materials": {
  "dur": 31.69,
  "lines": [
   [
    0.35,
    3.134,
    "The architecture is in the materials."
   ],
   [
    3.584,
    9.346,
    "At the Hub, concrete brings thermal mass, and stands up to salt air on the waterfront."
   ],
   [
    9.796,
    15.517,
    "Pigmented plaster carries its colour through the finish, with far less need to repaint."
   ],
   [
    15.967,
    21.769,
    "Full height glazing opens every floor to the harbour, while vertical fins shade the glass."
   ],
   [
    22.219,
    31.24,
    "At the Centre, brick, ochre plaster and stone. At the Spoke, natural stone and warm plaster. Chosen once, and built to last."
   ]
  ]
 },
 "capital": {
  "dur": 34.4,
  "lines": [
   [
    0.35,
    3.687,
    "For the finance committee, the logic is disciplined."
   ],
   [
    4.137,
    12.958,
    "Design once and deploy many. One repeatable kit of parts lowers design cost and delivery risk at every new site."
   ],
   [
    13.408,
    20.181,
    "Smart building systems measure utilisation and energy, so every square metre earns its keep."
   ],
   [
    20.631,
    27.904,
    "Each site opens new partnership income, from industry research to conferencing and community programmes."
   ],
   [
    28.354,
    33.949,
    "And capital is released gate by gate, only against evidence from the gate before."
   ]
  ]
 },
 "ask": {
  "dur": 16.07,
  "lines": [
   [
    0.35,
    10.423,
    "We ask the board to approve funding to take the Hub through detailed design and a full business case, as the first gated phase of UNISA Global."
   ],
   [
    10.873,
    15.619,
    "UNISA Global. Connected. Present. Ready for Africa's future."
   ]
  ]
 }
};
window.VO_PLAN={"africa":[["opening",0],["opening",1],["opening",2],["opening",3],["opening",4]],"vision":[["vision",0],["vision",1],["vision",2]],"network":[["network",0],["network",1]],"preface":[["preface",0],["preface",1],["preface",2]],"question":[["question",0],["question",1]],"model":[["model",0],["model",1],["model",2]],"journey":[["journey",0],["journey",1],["journey",2],["journey",3],["journey",4],["journey",5]],"sites":[["sites",0],["sites",1],["sites",2]],"brief":[["sites",3]],"materials":[["materials",0],["materials",1],["materials",2],["materials",3]],"palette":[["materials",4]],"capital":[["capital",0],["capital",1]],"levers":[["capital",2],["capital",3]],"gates":[["capital",4]],"ask":[["ask",0],["ask",1]],"gallery":[]};
