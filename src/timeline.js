// Film timeline: 53 shots on a 1080 x 1080, 24 fps canvas. Frame times are "frame / 24".
// Each shot carries `beats` (when each line starts, in shot-local seconds) and `captions`
// (global seconds, with per-word times). All caption, beat and brief text here is a neutral
// placeholder: caption words are placeholder tokens (tokaa, tokab, ...) that the scenes key their
// timing to, so the picture still cuts on the same frames.
FILM.TIMELINE = {
 "title": "parable-of-the-ring",
 "width": 1080,
 "height": 1080,
 "fps": 24,
 "bpm": 120,
 "duration": 8156 / 24,
 "shots": [
  {
   "id": "scene-01",
   "post": false,
   "file": "01-scene-01.js",
   "start": 0 / 24,
   "end": 137 / 24,
   "mode": "illustrated",
   "loc": "LI",
   "brief": "Scene 01 brief placeholder",
   "beats": [
    {
     "t": 1.21,
     "text": "tokaa tokab tokac tokad tokae tokaf tokag tokah tokai tokaj tokak"
    }
   ],
   "captions": [
    {
     "t0": 1.13,
     "t1": 5.41,
     "text": "Scene 01 caption 1 placeholder",
     "words": [
      [1.21, "tokaa"],
      [1.278, "tokab"],
      [1.903, "tokac"],
      [2.04, "tokad"],
      [3.184, "tokae"],
      [3.297, "tokaf"],
      [3.593, "tokag"],
      [3.752, "tokah"],
      [4.082, "tokai"],
      [4.479, "tokaj"],
      [4.741, "tokak"]
     ]
    }
   ]
  },
  {
   "id": "scene-02",
   "post": false,
   "file": "02-scene-02.js",
   "start": 137 / 24,
   "end": 216 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 02 brief placeholder",
   "beats": [
    {
     "t": 0.65,
     "text": "tokaj tokal tokam tokan tokao tokac tokap"
    }
   ],
   "captions": [
    {
     "t0": 6.28,
     "t1": 9.06,
     "text": "Scene 02 caption 1 placeholder",
     "words": [
      [6.36, "tokaj"],
      [6.78, "tokal"],
      [7.031, "tokam"],
      [7.367, "tokan"],
      [7.871, "tokao"],
      [8.122, "tokac"],
      [8.29, "tokap"]
     ]
    }
   ]
  },
  {
   "id": "scene-03",
   "post": false,
   "file": "03-scene-03.js",
   "start": 216 / 24,
   "end": 316 / 24,
   "mode": "illustrated",
   "loc": "LA",
   "brief": "Scene 03 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokaq tokao tokar tokas tokat tokau tokav tokaw tokax tokay tokaz"
    }
   ],
   "captions": [
    {
     "t0": 6.28,
     "t1": 9.06,
     "text": "Scene 03 caption 1 placeholder",
     "words": [
      [6.36, "tokaj"],
      [6.78, "tokal"],
      [7.031, "tokam"],
      [7.367, "tokan"],
      [7.871, "tokao"],
      [8.122, "tokac"],
      [8.29, "tokap"]
     ]
    },
    {
     "t0": 9.18,
     "t1": 13.26,
     "text": "Scene 03 caption 2 placeholder",
     "words": [
      [9.26, "tokaq"],
      [10.021, "tokao"],
      [10.468, "tokar"],
      [10.658, "tokas"],
      [10.782, "tokat"],
      [11.086, "tokau"],
      [11.438, "tokav"],
      [11.695, "tokaw"],
      [12.379, "tokax"],
      [12.513, "tokay"],
      [12.617, "tokaz"]
     ]
    }
   ]
  },
  {
   "id": "scene-04",
   "post": false,
   "file": "04-scene-04.js",
   "start": 316 / 24,
   "end": 456 / 24,
   "mode": "illustrated",
   "loc": "LA",
   "brief": "Scene 04 brief placeholder",
   "beats": [
    {
     "t": 0.29,
     "text": "tokay tokag tokba tokbb tokag tokbc"
    },
    {
     "t": 4.13,
     "text": "tokaq tokbd tokaw tokbe tokao tokbf tokbg tokbh tokao tokbi tokbj"
    }
   ],
   "captions": [
    {
     "t0": 9.18,
     "t1": 13.26,
     "text": "Scene 04 caption 1 placeholder",
     "words": [
      [9.26, "tokaq"],
      [10.021, "tokao"],
      [10.468, "tokar"],
      [10.658, "tokas"],
      [10.782, "tokat"],
      [11.086, "tokau"],
      [11.438, "tokav"],
      [11.695, "tokaw"],
      [12.379, "tokax"],
      [12.513, "tokay"],
      [12.617, "tokaz"]
     ]
    },
    {
     "t0": 13.38,
     "t1": 17.17,
     "text": "Scene 04 caption 2 placeholder",
     "words": [
      [13.46, "tokay"],
      [13.794, "tokag"],
      [14.239, "tokba"],
      [14.795, "tokbb"],
      [15.574, "tokag"],
      [16.019, "tokbc"]
     ]
    },
    {
     "t0": 17.22,
     "t1": 20.54,
     "text": "Scene 04 caption 3 placeholder",
     "words": [
      [17.3, "tokaq"],
      [17.982, "tokbd"],
      [18.13, "tokaw"],
      [18.199, "tokbe"],
      [18.516, "tokao"],
      [18.664, "tokbf"],
      [19.01, "tokbg"],
      [19.277, "tokbh"],
      [19.514, "tokao"],
      [19.652, "tokbi"],
      [19.959, "tokbj"]
     ]
    }
   ]
  },
  {
   "id": "scene-05",
   "post": false,
   "file": "05-scene-05.js",
   "start": 456 / 24,
   "end": 620 / 24,
   "mode": "illustrated",
   "loc": "LA",
   "brief": "Scene 05 brief placeholder",
   "beats": [
    {
     "t": 1.74,
     "text": "tokbk tokbf tokbl tokaw tokbj"
    },
    {
     "t": 3.18,
     "text": "tokac tokbm tokao tokbn tokbo tokac tokbp tokbq tokbr tokbs tokbt"
    }
   ],
   "captions": [
    {
     "t0": 17.22,
     "t1": 20.54,
     "text": "Scene 05 caption 1 placeholder",
     "words": [
      [17.3, "tokaq"],
      [17.982, "tokbd"],
      [18.13, "tokaw"],
      [18.199, "tokbe"],
      [18.516, "tokao"],
      [18.664, "tokbf"],
      [19.01, "tokbg"],
      [19.277, "tokbh"],
      [19.514, "tokao"],
      [19.652, "tokbi"],
      [19.959, "tokbj"]
     ]
    },
    {
     "t0": 20.66,
     "t1": 22.05,
     "text": "Scene 05 caption 2 placeholder",
     "words": [
      [20.74, "tokbk"],
      [21.1, "tokbf"],
      [21.325, "tokbl"],
      [21.686, "tokaw"],
      [21.881, "tokbj"]
     ]
    },
    {
     "t0": 22.1,
     "t1": 25.89,
     "text": "Scene 05 caption 3 placeholder",
     "words": [
      [22.18, "tokac"],
      [22.258, "tokbm"],
      [22.606, "tokao"],
      [22.897, "tokbn"],
      [23.091, "tokbo"],
      [23.362, "tokac"],
      [23.498, "tokbp"],
      [24.05, "tokbq"],
      [24.535, "tokbr"],
      [24.855, "tokbs"],
      [25.271, "tokbt"]
     ]
    }
   ]
  },
  {
   "id": "scene-06",
   "post": false,
   "file": "06-scene-06.js",
   "start": 620 / 24,
   "end": 752 / 24,
   "mode": "illustrated",
   "loc": "LA",
   "brief": "Scene 06 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokay tokag tokac tokap"
    },
    {
     "t": 1.67,
     "text": "tokaq tokbu tokbv tokbw tokaa tokbx tokby tokbz tokay tokca tokao tokbf tokcb"
    }
   ],
   "captions": [
    {
     "t0": 22.1,
     "t1": 25.89,
     "text": "Scene 06 caption 1 placeholder",
     "words": [
      [22.18, "tokac"],
      [22.258, "tokbm"],
      [22.606, "tokao"],
      [22.897, "tokbn"],
      [23.091, "tokbo"],
      [23.362, "tokac"],
      [23.498, "tokbp"],
      [24.05, "tokbq"],
      [24.535, "tokbr"],
      [24.855, "tokbs"],
      [25.271, "tokbt"]
     ]
    },
    {
     "t0": 26.01,
     "t1": 27.3,
     "text": "Scene 06 caption 2 placeholder",
     "words": [
      [26.09, "tokay"],
      [26.327, "tokag"],
      [26.723, "tokac"],
      [26.881, "tokap"]
     ]
    },
    {
     "t0": 27.42,
     "t1": 31.41,
     "text": "Scene 06 caption 3 placeholder",
     "words": [
      [27.5, "tokaq"],
      [27.737, "tokbu"],
      [27.975, "tokbv"],
      [28.271, "tokbw"],
      [28.687, "tokaa"],
      [28.865, "tokbx"],
      [29.161, "tokby"],
      [29.695, "tokbz"],
      [29.933, "tokay"],
      [30.111, "tokca"],
      [30.348, "tokao"],
      [30.526, "tokbf"],
      [30.763, "tokcb"]
     ]
    }
   ]
  },
  {
   "id": "scene-07",
   "post": false,
   "file": "07-scene-07.js",
   "start": 752 / 24,
   "end": 964 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 07 brief placeholder",
   "beats": [
    {
     "t": 0.28,
     "text": "tokcc tokas tokbh tokaa tokau tokcd"
    },
    {
     "t": 2.87,
     "text": "tokaq tokac tokce tokcf tokcg tokch tokci tokbf tokcj tokck tokbt"
    },
    {
     "t": 6.35,
     "text": "tokac tokcl tokap tokae tokac tokat"
    }
   ],
   "captions": [
    {
     "t0": 27.42,
     "t1": 31.41,
     "text": "Scene 07 caption 1 placeholder",
     "words": [
      [27.5, "tokaq"],
      [27.737, "tokbu"],
      [27.975, "tokbv"],
      [28.271, "tokbw"],
      [28.687, "tokaa"],
      [28.865, "tokbx"],
      [29.161, "tokby"],
      [29.695, "tokbz"],
      [29.933, "tokay"],
      [30.111, "tokca"],
      [30.348, "tokao"],
      [30.526, "tokbf"],
      [30.763, "tokcb"]
     ]
    },
    {
     "t0": 31.53,
     "t1": 34.07,
     "text": "Scene 07 caption 2 placeholder",
     "words": [
      [31.61, "tokcc"],
      [31.898, "tokas"],
      [32.281, "tokbh"],
      [32.665, "tokaa"],
      [32.953, "tokau"],
      [33.432, "tokcd"]
     ]
    },
    {
     "t0": 34.12,
     "t1": 37.55,
     "text": "Scene 07 caption 3 placeholder",
     "words": [
      [34.2, "tokaq"],
      [34.41, "tokac"],
      [34.474, "tokce"],
      [34.758, "tokcf"],
      [34.968, "tokcg"],
      [35.535, "tokch"],
      [36.238, "tokci"],
      [36.275, "tokbf"],
      [36.449, "tokcj"],
      [36.695, "tokck"],
      [37.024, "tokbt"]
     ]
    },
    {
     "t0": 37.6,
     "t1": 40.24,
     "text": "Scene 07 caption 4 placeholder",
     "words": [
      [37.68, "tokac"],
      [37.999, "tokcl"],
      [38.69, "tokap"],
      [39.208, "tokae"],
      [39.554, "tokac"],
      [39.713, "tokat"]
     ]
    }
   ]
  },
  {
   "id": "scene-08",
   "post": false,
   "file": "08-scene-08.js",
   "start": 964 / 24,
   "end": 1060 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 08 brief placeholder",
   "beats": [
    {
     "t": 0.24,
     "text": "tokcm tokcn tokbb tokch tokco tokbv tokcp"
    },
    {
     "t": 2.97,
     "text": "tokaa tokcq tokcr"
    }
   ],
   "captions": [
    {
     "t0": 37.6,
     "t1": 40.24,
     "text": "Scene 08 caption 1 placeholder",
     "words": [
      [37.68, "tokac"],
      [37.999, "tokcl"],
      [38.69, "tokap"],
      [39.208, "tokae"],
      [39.554, "tokac"],
      [39.713, "tokat"]
     ]
    },
    {
     "t0": 40.33,
     "t1": 42.94,
     "text": "Scene 08 caption 2 placeholder",
     "words": [
      [40.41, "tokcm"],
      [40.623, "tokcn"],
      [40.889, "tokbb"],
      [41.261, "tokch"],
      [41.633, "tokco"],
      [41.899, "tokbv"],
      [42.165, "tokcp"]
     ]
    },
    {
     "t0": 43.06,
     "t1": 44.25,
     "text": "Scene 08 caption 3 placeholder",
     "words": [
      [43.14, "tokaa"],
      [43.347, "tokcq"],
      [43.624, "tokcr"]
     ]
    }
   ]
  },
  {
   "id": "scene-09",
   "post": false,
   "file": "09-scene-09.js",
   "start": 1060 / 24,
   "end": 1165 / 24,
   "mode": "illustrated",
   "loc": "LC",
   "brief": "Scene 09 brief placeholder",
   "beats": [
    {
     "t": 0.25,
     "text": "tokac tokcs tokct tokcu tokcv tokcw tokam tokcs tokaa tokcx tokcy"
    }
   ],
   "captions": [
    {
     "t0": 43.06,
     "t1": 44.25,
     "text": "Scene 09 caption 1 placeholder",
     "words": [
      [43.14, "tokaa"],
      [43.347, "tokcq"],
      [43.624, "tokcr"]
     ]
    },
    {
     "t0": 44.34,
     "t1": 48.62,
     "text": "Scene 09 caption 2 placeholder",
     "words": [
      [44.42, "tokac"],
      [44.563, "tokcs"],
      [44.99, "tokct"],
      [45.347, "tokcu"],
      [45.703, "tokcv"],
      [46.131, "tokcw"],
      [46.488, "tokam"],
      [46.773, "tokcs"],
      [47.201, "tokaa"],
      [47.414, "tokcx"],
      [47.842, "tokcy"]
     ]
    }
   ]
  },
  {
   "id": "scene-10",
   "post": false,
   "file": "10-scene-10.js",
   "start": 1165 / 24,
   "end": 1316 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 10 brief placeholder",
   "beats": [
    {
     "t": 0.27,
     "text": "tokaa tokcz tokca tokaw tokda tokcr"
    },
    {
     "t": 2.45,
     "text": "tokaq tokdb tokam tokap tokdc tokca tokao tokam tokcf tokdd tokde"
    },
    {
     "t": 5.33,
     "text": "tokdf tokdg tokck"
    }
   ],
   "captions": [
    {
     "t0": 44.34,
     "t1": 48.62,
     "text": "Scene 10 caption 1 placeholder",
     "words": [
      [44.42, "tokac"],
      [44.563, "tokcs"],
      [44.99, "tokct"],
      [45.347, "tokcu"],
      [45.703, "tokcv"],
      [46.131, "tokcw"],
      [46.488, "tokam"],
      [46.773, "tokcs"],
      [47.201, "tokaa"],
      [47.414, "tokcx"],
      [47.842, "tokcy"]
     ]
    },
    {
     "t0": 48.73,
     "t1": 50.86,
     "text": "Scene 10 caption 2 placeholder",
     "words": [
      [48.81, "tokaa"],
      [49.015, "tokcz"],
      [49.56, "tokca"],
      [49.833, "tokaw"],
      [50.038, "tokda"],
      [50.447, "tokcr"]
     ]
    },
    {
     "t0": 50.91,
     "t1": 53.74,
     "text": "Scene 10 caption 3 placeholder",
     "words": [
      [50.99, "tokaq"],
      [51.119, "tokdb"],
      [51.544, "tokam"],
      [51.72, "tokap"],
      [51.987, "tokdc"],
      [52.218, "tokca"],
      [52.366, "tokao"],
      [52.606, "tokam"],
      [52.754, "tokcf"],
      [52.754, "tokdd"],
      [53.373, "tokde"]
     ]
    },
    {
     "t0": 53.79,
     "t1": 54.71,
     "text": "Scene 10 caption 4 placeholder",
     "words": [
      [53.87, "tokdf"],
      [53.915, "tokdg"],
      [54.762, "tokck"]
     ]
    },
    {
     "t0": 54.76,
     "t1": 56.7,
     "text": "Scene 10 caption 5 placeholder",
     "words": [
      [54.84, "tokaq"],
      [55.072, "tokdh"],
      [55.396, "tokbu"],
      [55.905, "tokam"],
      [55.951, "tokdi"],
      [56.229, "tokdj"]
     ]
    }
   ]
  },
  {
   "id": "scene-11",
   "post": false,
   "file": "11-scene-11.js",
   "start": 1316 / 24,
   "end": 1358 / 24,
   "mode": "illustrated",
   "loc": "LA",
   "brief": "Scene 11 brief placeholder",
   "beats": [
    {
     "t": 0.01,
     "text": "tokaq tokdh tokbu tokam tokdi tokdj"
    }
   ],
   "captions": [
    {
     "t0": 54.76,
     "t1": 56.7,
     "text": "Scene 11 caption 1 placeholder",
     "words": [
      [54.84, "tokaq"],
      [55.072, "tokdh"],
      [55.396, "tokbu"],
      [55.905, "tokam"],
      [55.951, "tokdi"],
      [56.229, "tokdj"]
     ]
    }
   ]
  },
  {
   "id": "scene-12",
   "post": false,
   "file": "12-scene-12.js",
   "start": 1358 / 24,
   "end": 1491 / 24,
   "mode": "illustrated",
   "loc": "LD",
   "brief": "Scene 12 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokcm tokaa tokby tokdk tokcr"
    },
    {
     "t": 1.8,
     "text": "tokdl tokaa tokdm tokaa tokdn tokaw tokdo tokbv tokap"
    }
   ],
   "captions": [
    {
     "t0": 54.76,
     "t1": 56.7,
     "text": "Scene 12 caption 1 placeholder",
     "words": [
      [54.84, "tokaq"],
      [55.072, "tokdh"],
      [55.396, "tokbu"],
      [55.905, "tokam"],
      [55.951, "tokdi"],
      [56.229, "tokdj"]
     ]
    },
    {
     "t0": 56.76,
     "t1": 58.25,
     "text": "Scene 12 caption 2 placeholder",
     "words": [
      [56.84, "tokcm"],
      [56.997, "tokaa"],
      [57.102, "tokby"],
      [57.565, "tokdk"],
      [57.88, "tokcr"]
     ]
    },
    {
     "t0": 58.3,
     "t1": 61.78,
     "text": "Scene 12 caption 3 placeholder",
     "words": [
      [58.38, "tokdl"],
      [59.222, "tokaa"],
      [59.398, "tokdm"],
      [59.721, "tokaa"],
      [59.97, "tokdn"],
      [60.438, "tokaw"],
      [60.531, "tokdo"],
      [60.905, "tokbv"],
      [61.186, "tokap"]
     ]
    }
   ]
  },
  {
   "id": "scene-13",
   "post": false,
   "file": "13-scene-13.js",
   "start": 1491 / 24,
   "end": 1569 / 24,
   "mode": "illustrated",
   "loc": "LA",
   "brief": "Scene 13 brief placeholder",
   "beats": [
    {
     "t": 0.7,
     "text": "tokdp tokas tokdq tokdr"
    }
   ],
   "captions": [
    {
     "t0": 62.75,
     "t1": 65.41,
     "text": "Scene 13 caption 1 placeholder",
     "words": [
      [62.83, "tokdp"],
      [63.715, "tokas"],
      [63.901, "tokdq"],
      [65.01, "tokdr"]
     ]
    }
   ]
  },
  {
   "id": "scene-14",
   "post": false,
   "file": "14-scene-14.js",
   "start": 1569 / 24,
   "end": 1654 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 14 brief placeholder",
   "beats": [
    {
     "t": 0.16,
     "text": "tokac tokds tokdt tokdu tokdv tokdw tokbt tokdx tokay"
    }
   ],
   "captions": [
    {
     "t0": 62.75,
     "t1": 65.41,
     "text": "Scene 14 caption 1 placeholder",
     "words": [
      [62.83, "tokdp"],
      [63.715, "tokas"],
      [63.901, "tokdq"],
      [65.01, "tokdr"]
     ]
    },
    {
     "t0": 65.46,
     "t1": 68.99,
     "text": "Scene 14 caption 2 placeholder",
     "words": [
      [65.54, "tokac"],
      [65.55, "tokds"],
      [65.91, "tokdt"],
      [66.825, "tokdu"],
      [67.224, "tokdv"],
      [67.604, "tokdw"],
      [67.837, "tokbt"],
      [68.071, "tokdx"],
      [68.392, "tokay"]
     ]
    }
   ]
  },
  {
   "id": "scene-15",
   "post": false,
   "file": "15-scene-15.js",
   "start": 1654 / 24,
   "end": 1749 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 15 brief placeholder",
   "beats": [
    {
     "t": 0.3,
     "text": "tokam tokdy"
    },
    {
     "t": 1.52,
     "text": "tokdz tokea tokeb"
    }
   ],
   "captions": [
    {
     "t0": 65.46,
     "t1": 68.99,
     "text": "Scene 15 caption 1 placeholder",
     "words": [
      [65.54, "tokac"],
      [65.55, "tokds"],
      [65.91, "tokdt"],
      [66.825, "tokdu"],
      [67.224, "tokdv"],
      [67.604, "tokdw"],
      [67.837, "tokbt"],
      [68.071, "tokdx"],
      [68.392, "tokay"]
     ]
    },
    {
     "t0": 69.14,
     "t1": 70.24,
     "text": "Scene 15 caption 2 placeholder",
     "words": [
      [69.22, "tokam"],
      [69.836, "tokdy"]
     ]
    },
    {
     "t0": 70.36,
     "t1": 72.96,
     "text": "Scene 15 caption 3 placeholder",
     "words": [
      [70.44, "tokdz"],
      [71.438, "tokea"],
      [72.436, "tokeb"]
     ]
    }
   ]
  },
  {
   "id": "scene-16",
   "post": false,
   "file": "16-scene-16.js",
   "start": 1749 / 24,
   "end": 1882 / 24,
   "mode": "illustrated",
   "loc": "LD",
   "brief": "Scene 16 brief placeholder",
   "beats": [
    {
     "t": 0.22,
     "text": "tokcc tokam tokat tokec toked tokam tokee tokef tokeg tokeh tokbx tokaw tokbz tokca tokao tokei"
    }
   ],
   "captions": [
    {
     "t0": 70.36,
     "t1": 72.96,
     "text": "Scene 16 caption 1 placeholder",
     "words": [
      [70.44, "tokdz"],
      [71.438, "tokea"],
      [72.436, "tokeb"]
     ]
    },
    {
     "t0": 73.02,
     "t1": 78.5,
     "text": "Scene 16 caption 2 placeholder",
     "words": [
      [73.1, "tokcc"],
      [73.262, "tokam"],
      [73.516, "tokat"],
      [73.953, "tokec"],
      [74.024, "toked"],
      [74.552, "tokam"],
      [74.704, "tokee"],
      [75.456, "tokef"],
      [75.984, "tokeg"],
      [76.227, "tokeh"],
      [76.674, "tokbx"],
      [76.979, "tokaw"],
      [77.141, "tokbz"],
      [77.395, "tokca"],
      [77.649, "tokao"],
      [77.801, "tokei"]
     ]
    }
   ]
  },
  {
   "id": "scene-17",
   "post": false,
   "file": "17-scene-17.js",
   "start": 1882 / 24,
   "end": 1946 / 24,
   "mode": "illustrated",
   "loc": "LE",
   "brief": "Scene 17 brief placeholder",
   "beats": [
    {
     "t": 0.21,
     "text": "tokdf tokej tokac tokek tokck tokam tokel tokem"
    }
   ],
   "captions": [
    {
     "t0": 73.02,
     "t1": 78.5,
     "text": "Scene 17 caption 1 placeholder",
     "words": [
      [73.1, "tokcc"],
      [73.262, "tokam"],
      [73.516, "tokat"],
      [73.953, "tokec"],
      [74.024, "toked"],
      [74.552, "tokam"],
      [74.704, "tokee"],
      [75.456, "tokef"],
      [75.984, "tokeg"],
      [76.227, "tokeh"],
      [76.674, "tokbx"],
      [76.979, "tokaw"],
      [77.141, "tokbz"],
      [77.395, "tokca"],
      [77.649, "tokao"],
      [77.801, "tokei"]
     ]
    },
    {
     "t0": 78.55,
     "t1": 81.2,
     "text": "Scene 17 caption 2 placeholder",
     "words": [
      [78.63, "tokdf"],
      [78.966, "tokej"],
      [79.339, "tokac"],
      [79.46, "tokek"],
      [79.73, "tokck"],
      [80.122, "tokam"],
      [80.225, "tokel"],
      [80.672, "tokem"]
     ]
    }
   ]
  },
  {
   "id": "scene-18",
   "post": false,
   "file": "18-scene-18.js",
   "start": 1946 / 24,
   "end": 2106 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 18 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokdv token tokbt tokac tokeo"
    },
    {
     "t": 2.12,
     "text": "tokep tokeb tokac tokeq tokaq tokam toker tokcx tokes tokam tokap toket tokay tokag tokeu tokev"
    }
   ],
   "captions": [
    {
     "t0": 78.55,
     "t1": 81.2,
     "text": "Scene 18 caption 1 placeholder",
     "words": [
      [78.63, "tokdf"],
      [78.966, "tokej"],
      [79.339, "tokac"],
      [79.46, "tokek"],
      [79.73, "tokck"],
      [80.122, "tokam"],
      [80.225, "tokel"],
      [80.672, "tokem"]
     ]
    },
    {
     "t0": 81.26,
     "t1": 83.01,
     "text": "Scene 18 caption 2 placeholder",
     "words": [
      [81.34, "tokdv"],
      [81.663, "token"],
      [82.113, "tokbt"],
      [82.308, "tokac"],
      [82.554, "tokeo"]
     ]
    },
    {
     "t0": 83.12,
     "t1": 87.77,
     "text": "Scene 18 caption 3 placeholder",
     "words": [
      [83.2, "tokep"],
      [83.446, "tokeb"],
      [83.692, "tokac"],
      [83.757, "tokeq"],
      [84.25, "tokaq"],
      [84.296, "tokam"],
      [84.519, "toker"],
      [84.816, "tokcx"],
      [85.169, "tokes"],
      [85.448, "tokam"],
      [85.661, "tokap"],
      [85.94, "toket"],
      [86.293, "tokay"],
      [86.432, "tokag"],
      [86.748, "tokeu"],
      [87.082, "tokev"]
     ]
    }
   ]
  },
  {
   "id": "scene-19",
   "post": false,
   "file": "19-scene-19.js",
   "start": 2106 / 24,
   "end": 2306 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 19 brief placeholder",
   "beats": [
    {
     "t": 0.29,
     "text": "tokcr tokew tokam tokcf tokcg tokex tokay tokey"
    },
    {
     "t": 3.96,
     "text": "tokcm tokbb tokez tokbf tokfa tokfb tokfc tokay tokev tokfd tokaa tokfe"
    }
   ],
   "captions": [
    {
     "t0": 83.12,
     "t1": 87.77,
     "text": "Scene 19 caption 1 placeholder",
     "words": [
      [83.2, "tokep"],
      [83.446, "tokeb"],
      [83.692, "tokac"],
      [83.757, "tokeq"],
      [84.25, "tokaq"],
      [84.296, "tokam"],
      [84.519, "toker"],
      [84.816, "tokcx"],
      [85.169, "tokes"],
      [85.448, "tokam"],
      [85.661, "tokap"],
      [85.94, "toket"],
      [86.293, "tokay"],
      [86.432, "tokag"],
      [86.748, "tokeu"],
      [87.082, "tokev"]
     ]
    },
    {
     "t0": 87.96,
     "t1": 91.58,
     "text": "Scene 19 caption 2 placeholder",
     "words": [
      [88.04, "tokcr"],
      [88.296, "tokew"],
      [88.899, "tokam"],
      [89.072, "tokcf"],
      [89.502, "tokcg"],
      [90.197, "tokex"],
      [90.718, "tokay"],
      [90.984, "tokey"]
     ]
    },
    {
     "t0": 91.63,
     "t1": 96.18,
     "text": "Scene 19 caption 3 placeholder",
     "words": [
      [91.71, "tokcm"],
      [91.827, "tokbb"],
      [92.468, "tokez"],
      [92.671, "tokbf"],
      [93.098, "tokfa"],
      [93.536, "tokfb"],
      [93.92, "tokfc"],
      [94.411, "tokay"],
      [94.433, "tokev"],
      [94.71, "tokfd"],
      [95.308, "tokaa"],
      [95.5, "tokfe"]
     ]
    }
   ]
  },
  {
   "id": "scene-20",
   "post": false,
   "file": "20-scene-20.js",
   "start": 2306 / 24,
   "end": 2382 / 24,
   "mode": "illustrated",
   "loc": "LE",
   "brief": "Scene 20 brief placeholder",
   "beats": [
    {
     "t": 0.25,
     "text": "tokas tokff tokfg tokaq tokam tokeo tokag tokev"
    }
   ],
   "captions": [
    {
     "t0": 91.63,
     "t1": 96.18,
     "text": "Scene 20 caption 1 placeholder",
     "words": [
      [91.71, "tokcm"],
      [91.827, "tokbb"],
      [92.468, "tokez"],
      [92.671, "tokbf"],
      [93.098, "tokfa"],
      [93.536, "tokfb"],
      [93.92, "tokfc"],
      [94.411, "tokay"],
      [94.433, "tokev"],
      [94.71, "tokfd"],
      [95.308, "tokaa"],
      [95.5, "tokfe"]
     ]
    },
    {
     "t0": 96.25,
     "t1": 99.25,
     "text": "Scene 20 caption 2 placeholder",
     "words": [
      [96.33, "tokas"],
      [96.563, "tokff"],
      [97.029, "tokfg"],
      [97.57, "tokaq"],
      [97.804, "tokam"],
      [98.037, "tokeo"],
      [98.345, "tokag"],
      [98.694, "tokev"]
     ]
    }
   ]
  },
  {
   "id": "scene-21",
   "post": false,
   "file": "21-scene-21.js",
   "start": 2382 / 24,
   "end": 2453 / 24,
   "mode": "illustrated",
   "loc": "LD",
   "brief": "Scene 21 brief placeholder",
   "beats": [
    {
     "t": 0.32,
     "text": "tokae tokfh tokaa tokfi tokff tokas"
    }
   ],
   "captions": [
    {
     "t0": 99.49,
     "t1": 102.81,
     "text": "Scene 21 caption 1 placeholder",
     "words": [
      [99.57, "tokae"],
      [99.961, "tokfh"],
      [101.082, "tokaa"],
      [101.145, "tokfi"],
      [101.801, "tokff"],
      [102.425, "tokas"]
     ]
    }
   ]
  },
  {
   "id": "scene-22",
   "post": false,
   "file": "22-scene-22.js",
   "start": 2453 / 24,
   "end": 2552 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 22 brief placeholder",
   "beats": [
    {
     "t": 0.73,
     "text": "tokfj tokfk tokfj tokfl tokfj tokfm"
    }
   ],
   "captions": [
    {
     "t0": 99.49,
     "t1": 102.81,
     "text": "Scene 22 caption 1 placeholder",
     "words": [
      [99.57, "tokae"],
      [99.961, "tokfh"],
      [101.082, "tokaa"],
      [101.145, "tokfi"],
      [101.801, "tokff"],
      [102.425, "tokas"]
     ]
    },
    {
     "t0": 102.86,
     "t1": 106.42,
     "text": "Scene 22 caption 2 placeholder",
     "words": [
      [102.94, "tokfj"],
      [103.18, "tokfk"],
      [104.37, "tokfj"],
      [104.4, "tokfl"],
      [105.38, "tokfj"],
      [105.82, "tokfm"]
     ]
    }
   ]
  },
  {
   "id": "scene-23",
   "post": false,
   "file": "23-scene-23.js",
   "start": 2552 / 24,
   "end": 2656 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 23 brief placeholder",
   "beats": [
    {
     "t": 0.29,
     "text": "tokaq tokeq tokfn tokeq tokam tokat tokfo tokco tokac tokfp tokfq"
    }
   ],
   "captions": [
    {
     "t0": 102.86,
     "t1": 106.42,
     "text": "Scene 23 caption 1 placeholder",
     "words": [
      [102.94, "tokfj"],
      [103.18, "tokfk"],
      [104.37, "tokfj"],
      [104.4, "tokfl"],
      [105.38, "tokfj"],
      [105.82, "tokfm"]
     ]
    },
    {
     "t0": 106.54,
     "t1": 110.74,
     "text": "Scene 23 caption 2 placeholder",
     "words": [
      [106.62, "tokaq"],
      [106.919, "tokeq"],
      [107.429, "tokfn"],
      [107.516, "tokeq"],
      [108.104, "tokam"],
      [108.402, "tokat"],
      [108.701, "tokfo"],
      [109.356, "tokco"],
      [109.587, "tokac"],
      [109.587, "tokfp"],
      [110.088, "tokfq"]
     ]
    }
   ]
  },
  {
   "id": "scene-24",
   "post": false,
   "file": "24-scene-24.js",
   "start": 2656 / 24,
   "end": 2857 / 24,
   "mode": "illustrated",
   "loc": "LB",
   "brief": "Scene 24 brief placeholder",
   "beats": [
    {
     "t": 0.27,
     "text": "tokbk tokam tokfr tokfg tokfs tokft tokfu tokaq tokac tokfv"
    },
    {
     "t": 3.93,
     "text": "tokaq tokam tokcf tokfq tokfw tokbf tokde"
    },
    {
     "t": 6.34,
     "text": "tokfx tokag tokfy tokfz tokga"
    }
   ],
   "captions": [
    {
     "t0": 106.54,
     "t1": 110.74,
     "text": "Scene 24 caption 1 placeholder",
     "words": [
      [106.62, "tokaq"],
      [106.919, "tokeq"],
      [107.429, "tokfn"],
      [107.516, "tokeq"],
      [108.104, "tokam"],
      [108.402, "tokat"],
      [108.701, "tokfo"],
      [109.356, "tokco"],
      [109.587, "tokac"],
      [109.587, "tokfp"],
      [110.088, "tokfq"]
     ]
    },
    {
     "t0": 110.86,
     "t1": 114.47,
     "text": "Scene 24 caption 2 placeholder",
     "words": [
      [110.94, "tokbk"],
      [111.09, "tokam"],
      [111.31, "tokfr"],
      [111.68, "tokfg"],
      [112.288, "tokfs"],
      [112.702, "tokft"],
      [112.967, "tokfu"],
      [113.654, "tokaq"],
      [113.795, "tokac"],
      [113.866, "tokfv"]
     ]
    },
    {
     "t0": 114.52,
     "t1": 116.81,
     "text": "Scene 24 caption 3 placeholder",
     "words": [
      [114.6, "tokaq"],
      [114.855, "tokam"],
      [115.109, "tokcf"],
      [115.364, "tokfq"],
      [115.659, "tokfw"],
      [116.057, "tokbf"],
      [116.311, "tokde"]
     ]
    },
    {
     "t0": 116.93,
     "t1": 118.61,
     "text": "Scene 24 caption 4 placeholder",
     "words": [
      [117.01, "tokfx"],
      [117.178, "tokag"],
      [117.333, "tokfy"],
      [117.746, "tokfz"],
      [118.16, "tokga"]
     ]
    }
   ]
  },
  {
   "id": "scene-25",
   "post": false,
   "file": "25-scene-25.js",
   "start": 2857 / 24,
   "end": 2966 / 24,
   "mode": "illustrated",
   "loc": "LD",
   "brief": "Scene 25 brief placeholder",
   "beats": [
    {
     "t": 0.79,
     "text": "tokaw tokfc tokae tokgb tokbb tokdn tokgc tokam tokgd tokge"
    }
   ],
   "captions": [
    {
     "t0": 119.747,
     "t1": 123.647,
     "text": "Scene 25 caption 1 placeholder",
     "words": [
      [119.827, "tokaw"],
      [119.891, "tokfc"],
      [120.149, "tokae"],
      [120.407, "tokgb"],
      [121.418, "tokbb"],
      [121.665, "tokdn"],
      [121.923, "tokgc"],
      [122.428, "tokam"],
      [122.686, "tokgd"],
      [123.019, "tokge"]
     ]
    }
   ]
  },
  {
   "id": "scene-26",
   "post": false,
   "file": "26-scene-26.js",
   "start": 2966 / 24,
   "end": 3071 / 24,
   "mode": "illustrated",
   "loc": "LD",
   "brief": "Scene 26 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokaq tokdp tokac tokgf tokgg"
    },
    {
     "t": 2.77,
     "text": "tokaa tokag tokgh tokaw tokgi"
    }
   ],
   "captions": [
    {
     "t0": 119.747,
     "t1": 123.647,
     "text": "Scene 26 caption 1 placeholder",
     "words": [
      [119.827, "tokaw"],
      [119.891, "tokfc"],
      [120.149, "tokae"],
      [120.407, "tokgb"],
      [121.418, "tokbb"],
      [121.665, "tokdn"],
      [121.923, "tokgc"],
      [122.428, "tokam"],
      [122.686, "tokgd"],
      [123.019, "tokge"]
     ]
    },
    {
     "t0": 123.767,
     "t1": 126.157,
     "text": "Scene 26 caption 2 placeholder",
     "words": [
      [123.847, "tokaq"],
      [124.204, "tokdp"],
      [124.917, "tokac"],
      [125.37, "tokgf"],
      [125.65, "tokgg"]
     ]
    },
    {
     "t0": 126.277,
     "t1": 128.037,
     "text": "Scene 26 caption 3 placeholder",
     "words": [
      [126.357, "tokaa"],
      [126.521, "tokag"],
      [126.772, "tokgh"],
      [127.353, "tokaw"],
      [127.58, "tokgi"]
     ]
    }
   ]
  },
  {
   "id": "scene-27",
   "post": false,
   "file": "27-scene-27.js",
   "start": 3071 / 24,
   "end": 3191 / 24,
   "mode": "illustrated",
   "loc": "LF",
   "brief": "Scene 27 brief placeholder",
   "beats": [
    {
     "t": 0.28,
     "text": "tokaa tokby tokgj tokaw tokgk tokam tokap tokck tokdj"
    },
    {
     "t": 2.61,
     "text": "tokcc tokaa tokgl tokay tokcd tokac tokgm tokcd tokbf tokgn"
    }
   ],
   "captions": [
    {
     "t0": 126.277,
     "t1": 128.037,
     "text": "Scene 27 caption 1 placeholder",
     "words": [
      [126.357, "tokaa"],
      [126.521, "tokag"],
      [126.772, "tokgh"],
      [127.353, "tokaw"],
      [127.58, "tokgi"]
     ]
    },
    {
     "t0": 128.157,
     "t1": 130.437,
     "text": "Scene 27 caption 2 placeholder",
     "words": [
      [128.237, "tokaa"],
      [128.364, "tokby"],
      [128.875, "tokgj"],
      [129.13, "tokaw"],
      [129.257, "tokgk"],
      [129.677, "tokam"],
      [129.768, "tokap"],
      [130.023, "tokck"],
      [130.169, "tokdj"]
     ]
    },
    {
     "t0": 130.487,
     "t1": 133.027,
     "text": "Scene 27 caption 3 placeholder",
     "words": [
      [130.567, "tokcc"],
      [130.791, "tokaa"],
      [131.039, "tokgl"],
      [131.338, "tokay"],
      [131.437, "tokcd"],
      [131.636, "tokac"],
      [131.736, "tokgm"],
      [131.823, "tokcd"],
      [132.581, "tokbf"],
      [132.618, "tokgn"]
     ]
    }
   ]
  },
  {
   "id": "scene-28",
   "post": false,
   "file": "28-scene-28.js",
   "start": 3191 / 24,
   "end": 3377 / 24,
   "mode": "illustrated",
   "loc": "LF",
   "brief": "Scene 28 brief placeholder",
   "beats": [
    {
     "t": 0.2,
     "text": "tokck tokeg tokcd tokam tokgo tokac tokgp tokgq tokgr tokbv tokgn tokbk tokam tokgs"
    },
    {
     "t": 4.59,
     "text": "tokgt tokam tokgu tokaq tokgv tokgw tokgx tokam tokgy"
    }
   ],
   "captions": [
    {
     "t0": 130.487,
     "t1": 133.027,
     "text": "Scene 28 caption 1 placeholder",
     "words": [
      [130.567, "tokcc"],
      [130.791, "tokaa"],
      [131.039, "tokgl"],
      [131.338, "tokay"],
      [131.437, "tokcd"],
      [131.636, "tokac"],
      [131.736, "tokgm"],
      [131.823, "tokcd"],
      [132.581, "tokbf"],
      [132.618, "tokgn"]
     ]
    },
    {
     "t0": 133.077,
     "t1": 137.417,
     "text": "Scene 28 caption 2 placeholder",
     "words": [
      [133.157, "tokck"],
      [133.284, "tokeg"],
      [133.611, "tokcd"],
      [133.739, "tokam"],
      [133.929, "tokgo"],
      [134.566, "tokac"],
      [134.62, "tokgp"],
      [134.929, "tokgq"],
      [135.448, "tokgr"],
      [135.838, "tokbv"],
      [136.075, "tokgn"],
      [136.557, "tokbk"],
      [136.557, "tokam"],
      [136.975, "tokgs"]
     ]
    },
    {
     "t0": 137.467,
     "t1": 140.797,
     "text": "Scene 28 caption 3 placeholder",
     "words": [
      [137.547, "tokgt"],
      [137.826, "tokam"],
      [138.307, "tokgu"],
      [138.702, "tokaq"],
      [138.933, "tokgv"],
      [139.299, "tokgw"],
      [139.549, "tokgx"],
      [140.184, "tokam"],
      [140.252, "tokgy"]
     ]
    }
   ]
  },
  {
   "id": "scene-29",
   "post": false,
   "file": "29-scene-29.js",
   "start": 3377 / 24,
   "end": 3571 / 24,
   "mode": "illustrated",
   "loc": "LF",
   "brief": "Scene 29 brief placeholder",
   "beats": [
    {
     "t": 0.22,
     "text": "tokcc tokbb tokgz tokac tokha tokhb tokhc tokai tokbf tokak tokaq tokah tokam tokap tokcd"
    },
    {
     "t": 5.23,
     "text": "tokbo tokdp tokbk tokay tokau tokhd tokaa tokau"
    }
   ],
   "captions": [
    {
     "t0": 137.467,
     "t1": 140.797,
     "text": "Scene 29 caption 1 placeholder",
     "words": [
      [137.547, "tokgt"],
      [137.826, "tokam"],
      [138.307, "tokgu"],
      [138.702, "tokaq"],
      [138.933, "tokgv"],
      [139.299, "tokgw"],
      [139.549, "tokgx"],
      [140.184, "tokam"],
      [140.252, "tokgy"]
     ]
    },
    {
     "t0": 140.847,
     "t1": 145.727,
     "text": "Scene 29 caption 2 placeholder",
     "words": [
      [140.927, "tokcc"],
      [141.053, "tokbb"],
      [141.44, "tokgz"],
      [141.638, "tokac"],
      [141.701, "tokha"],
      [142.06, "tokhb"],
      [142.834, "tokhc"],
      [142.87, "tokai"],
      [143.23, "tokbf"],
      [143.797, "tokak"],
      [143.95, "tokaq"],
      [144.166, "tokah"],
      [144.517, "tokam"],
      [144.733, "tokap"],
      [145.021, "tokcd"]
     ]
    },
    {
     "t0": 145.857,
     "t1": 148.897,
     "text": "Scene 29 caption 3 placeholder",
     "words": [
      [145.937, "tokbo"],
      [146.245, "tokdp"],
      [146.563, "tokbk"],
      [146.899, "tokay"],
      [147.039, "tokau"],
      [147.319, "tokhd"],
      [147.749, "tokaa"],
      [148.356, "tokau"]
     ]
    }
   ]
  },
  {
   "id": "scene-30",
   "post": false,
   "file": "30-scene-30.js",
   "start": 3571 / 24,
   "end": 3633 / 24,
   "mode": "illustrated",
   "loc": "LG",
   "brief": "Scene 30 brief placeholder",
   "beats": [
    {
     "t": 0.24,
     "text": "tokhe tokaw tokgi tokaa tokhf"
    }
   ],
   "captions": [
    {
     "t0": 145.857,
     "t1": 148.897,
     "text": "Scene 30 caption 1 placeholder",
     "words": [
      [145.937, "tokbo"],
      [146.245, "tokdp"],
      [146.563, "tokbk"],
      [146.899, "tokay"],
      [147.039, "tokau"],
      [147.319, "tokhd"],
      [147.749, "tokaa"],
      [148.356, "tokau"]
     ]
    },
    {
     "t0": 148.947,
     "t1": 151.447,
     "text": "Scene 30 caption 2 placeholder",
     "words": [
      [149.027, "tokhe"],
      [149.756, "tokaw"],
      [149.979, "tokgi"],
      [150.832, "tokaa"],
      [150.931, "tokhf"]
     ]
    }
   ]
  },
  {
   "id": "scene-31",
   "post": false,
   "file": "31-scene-31.js",
   "start": 3633 / 24,
   "end": 3816 / 24,
   "mode": "illustrated",
   "loc": "LC",
   "brief": "Scene 31 brief placeholder",
   "beats": [
    {
     "t": 0.27,
     "text": "tokaq tokcd tokac tokhg tokam tokcs tokbo tokam tokcp tokgg tokaw tokbt"
    },
    {
     "t": 4.32,
     "text": "tokhh tokhi tokac tokhj"
    },
    {
     "t": 5.89,
     "text": "tokaa tokhk tokhl tokhm"
    }
   ],
   "captions": [
    {
     "t0": 148.947,
     "t1": 151.447,
     "text": "Scene 31 caption 1 placeholder",
     "words": [
      [149.027, "tokhe"],
      [149.756, "tokaw"],
      [149.979, "tokgi"],
      [150.832, "tokaa"],
      [150.931, "tokhf"]
     ]
    },
    {
     "t0": 151.567,
     "t1": 155.507,
     "text": "Scene 31 caption 2 placeholder",
     "words": [
      [151.647, "tokaq"],
      [151.96, "tokcd"],
      [152.182, "tokac"],
      [152.274, "tokhg"],
      [153.16, "tokam"],
      [153.234, "tokcs"],
      [153.547, "tokbo"],
      [153.658, "tokam"],
      [154.147, "tokcp"],
      [154.452, "tokgg"],
      [154.673, "tokaw"],
      [154.876, "tokbt"]
     ]
    },
    {
     "t0": 155.617,
     "t1": 157.137,
     "text": "Scene 31 caption 3 placeholder",
     "words": [
      [155.697, "tokhh"],
      [156.411, "tokhi"],
      [156.607, "tokac"],
      [156.7, "tokhj"]
     ]
    },
    {
     "t0": 157.187,
     "t1": 159.087,
     "text": "Scene 31 caption 4 placeholder",
     "words": [
      [157.267, "tokaa"],
      [157.594, "tokhk"],
      [158.278, "tokhl"],
      [158.619, "tokhm"]
     ]
    }
   ]
  },
  {
   "id": "scene-32",
   "post": false,
   "file": "32-scene-32.js",
   "start": 3816 / 24,
   "end": 3919 / 24,
   "mode": "illustrated",
   "loc": "LH",
   "brief": "Scene 32 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokhn tokho tokhp tokhq"
    },
    {
     "t": 2.05,
     "text": "tokhr tokaw tokhs tokam tokht tokdg"
    }
   ],
   "captions": [
    {
     "t0": 157.187,
     "t1": 159.087,
     "text": "Scene 32 caption 1 placeholder",
     "words": [
      [157.267, "tokaa"],
      [157.594, "tokhk"],
      [158.278, "tokhl"],
      [158.619, "tokhm"]
     ]
    },
    {
     "t0": 159.177,
     "t1": 160.917,
     "text": "Scene 32 caption 2 placeholder",
     "words": [
      [159.257, "tokhn"],
      [159.996, "tokho"],
      [160.159, "tokhp"],
      [160.572, "tokhq"]
     ]
    },
    {
     "t0": 160.967,
     "t1": 163.317,
     "text": "Scene 32 caption 3 placeholder",
     "words": [
      [161.047, "tokhr"],
      [161.636, "tokaw"],
      [161.783, "tokhs"],
      [162.395, "tokam"],
      [162.836, "tokht"],
      [163.006, "tokdg"]
     ]
    }
   ]
  },
  {
   "id": "scene-33",
   "post": false,
   "file": "33-scene-33.js",
   "start": 3919 / 24,
   "end": 4071 / 24,
   "mode": "illustrated",
   "loc": "LI",
   "brief": "Scene 33 brief placeholder",
   "beats": [
    {
     "t": 0.16,
     "text": "tokcd tokam tokhu tokao tokhv tokhn tokdh tokae tokhw tokav tokam tokhx"
    },
    {
     "t": 3.48,
     "text": "tokaq tokhy tokhz tokam tokak tokdc tokev tokbf tokcb"
    }
   ],
   "captions": [
    {
     "t0": 160.967,
     "t1": 163.317,
     "text": "Scene 33 caption 1 placeholder",
     "words": [
      [161.047, "tokhr"],
      [161.636, "tokaw"],
      [161.783, "tokhs"],
      [162.395, "tokam"],
      [162.836, "tokht"],
      [163.006, "tokdg"]
     ]
    },
    {
     "t0": 163.367,
     "t1": 166.637,
     "text": "Scene 33 caption 2 placeholder",
     "words": [
      [163.447, "tokcd"],
      [163.607, "tokam"],
      [163.847, "tokhu"],
      [164.238, "tokao"],
      [164.388, "tokhv"],
      [164.889, "tokhn"],
      [165.149, "tokdh"],
      [165.339, "tokae"],
      [165.53, "tokhw"],
      [165.85, "tokav"],
      [166.431, "tokam"],
      [166.501, "tokhx"]
     ]
    },
    {
     "t0": 166.687,
     "t1": 169.667,
     "text": "Scene 33 caption 3 placeholder",
     "words": [
      [166.767, "tokaq"],
      [166.968, "tokhy"],
      [167.509, "tokhz"],
      [167.987, "tokam"],
      [168.199, "tokak"],
      [168.92, "tokdc"],
      [169.048, "tokev"],
      [169.09, "tokbf"],
      [169.26, "tokcb"]
     ]
    }
   ]
  },
  {
   "id": "scene-34",
   "post": false,
   "file": "34-scene-34.js",
   "start": 4071 / 24,
   "end": 4247 / 24,
   "mode": "illustrated",
   "loc": "LI",
   "brief": "Scene 34 brief placeholder",
   "beats": [
    {
     "t": 0.17,
     "text": "tokaa tokia tokay tokaw tokib"
    },
    {
     "t": 1.47,
     "text": "tokcm tokam tokap tokag tokcd tokbv tokak"
    },
    {
     "t": 3.43,
     "text": "tokbf tokgq tokic tokbt tokaw tokes tokbf tokcb tokci"
    },
    {
     "t": 6.06,
     "text": "tokaa tokau tokid tokie"
    }
   ],
   "captions": [
    {
     "t0": 166.687,
     "t1": 169.667,
     "text": "Scene 34 caption 1 placeholder",
     "words": [
      [166.767, "tokaq"],
      [166.968, "tokhy"],
      [167.509, "tokhz"],
      [167.987, "tokam"],
      [168.199, "tokak"],
      [168.92, "tokdc"],
      [169.048, "tokev"],
      [169.09, "tokbf"],
      [169.26, "tokcb"]
     ]
    },
    {
     "t0": 169.717,
     "t1": 170.967,
     "text": "Scene 34 caption 2 placeholder",
     "words": [
      [169.797, "tokaa"],
      [169.99, "tokia"],
      [170.39, "tokay"],
      [170.57, "tokaw"],
      [170.763, "tokib"]
     ]
    },
    {
     "t0": 171.017,
     "t1": 172.927,
     "text": "Scene 34 caption 3 placeholder",
     "words": [
      [171.097, "tokcm"],
      [171.491, "tokam"],
      [171.607, "tokap"],
      [171.931, "tokag"],
      [172.174, "tokcd"],
      [172.336, "tokbv"],
      [172.661, "tokak"]
     ]
    },
    {
     "t0": 172.977,
     "t1": 175.557,
     "text": "Scene 34 caption 4 placeholder",
     "words": [
      [173.057, "tokbf"],
      [173.24, "tokgq"],
      [173.749, "tokic"],
      [174.167, "tokbt"],
      [174.34, "tokaw"],
      [174.635, "tokes"],
      [174.727, "tokbf"],
      [174.91, "tokcb"],
      [175.154, "tokci"]
     ]
    },
    {
     "t0": 175.607,
     "t1": 177.047,
     "text": "Scene 34 caption 5 placeholder",
     "words": [
      [175.687, "tokaa"],
      [175.892, "tokau"],
      [176.317, "tokid"],
      [176.69, "tokie"]
     ]
    }
   ]
  },
  {
   "id": "scene-35",
   "post": false,
   "file": "35-scene-35.js",
   "start": 4247 / 24,
   "end": 4384 / 24,
   "mode": "illustrated",
   "loc": "LI",
   "brief": "Scene 35 brief placeholder",
   "beats": [
    {
     "t": 0.22,
     "text": "tokaa tokdf tokam tokak"
    },
    {
     "t": 2.28,
     "text": "tokaq tokam tokif tokdf tokbt"
    }
   ],
   "captions": [
    {
     "t0": 175.607,
     "t1": 177.047,
     "text": "Scene 35 caption 1 placeholder",
     "words": [
      [175.687, "tokaa"],
      [175.892, "tokau"],
      [176.317, "tokid"],
      [176.69, "tokie"]
     ]
    },
    {
     "t0": 177.097,
     "t1": 178.587,
     "text": "Scene 35 caption 2 placeholder",
     "words": [
      [177.177, "tokaa"],
      [177.354, "tokdf"],
      [177.753, "tokam"],
      [178.152, "tokak"]
     ]
    },
    {
     "t0": 179.157,
     "t1": 181.787,
     "text": "Scene 35 caption 3 placeholder",
     "words": [
      [179.237, "tokaq"],
      [179.509, "tokam"],
      [179.911, "tokif"],
      [181.118, "tokdf"],
      [181.261, "tokbt"]
     ]
    }
   ]
  },
  {
   "id": "scene-36",
   "post": false,
   "file": "36-scene-36.js",
   "start": 4384 / 24,
   "end": 4658 / 24,
   "mode": "illustrated",
   "loc": "LJ",
   "brief": "Scene 36 brief placeholder",
   "beats": [
    {
     "t": 1.23,
     "text": "tokeg tokig tokih tokaa tokhk tokhl tokcd tokac tokii tokaq tokij tokae tokbf tokak"
    },
    {
     "t": 5.96,
     "text": "tokac tokhj tokik tokay tokil tokbt"
    },
    {
     "t": 7.81,
     "text": "tokaq tokbf tokde tokim tokam tokap tokin tokah tokai"
    }
   ],
   "captions": [
    {
     "t0": 183.818,
     "t1": 188.428,
     "text": "Scene 36 caption 1 placeholder",
     "words": [
      [183.898, "tokeg"],
      [184.152, "tokig"],
      [184.484, "tokih"],
      [185.264, "tokaa"],
      [185.274, "tokhk"],
      [185.606, "tokhl"],
      [185.772, "tokcd"],
      [185.938, "tokac"],
      [185.996, "tokii"],
      [186.875, "tokaq"],
      [186.953, "tokij"],
      [187.324, "tokae"],
      [187.529, "tokbf"],
      [187.744, "tokak"]
     ]
    },
    {
     "t0": 188.548,
     "t1": 190.348,
     "text": "Scene 36 caption 2 placeholder",
     "words": [
      [188.628, "tokac"],
      [188.788, "tokhj"],
      [189.082, "tokik"],
      [189.384, "tokay"],
      [189.536, "tokil"],
      [189.99, "tokbt"]
     ]
    },
    {
     "t0": 190.398,
     "t1": 194.168,
     "text": "Scene 36 caption 3 placeholder",
     "words": [
      [190.478, "tokaq"],
      [190.665, "tokbf"],
      [190.904, "tokde"],
      [191.205, "tokim"],
      [191.661, "tokam"],
      [191.848, "tokap"],
      [192.347, "tokin"],
      [192.876, "tokah"],
      [193.551, "tokai"]
     ]
    }
   ]
  },
  {
   "id": "scene-37",
   "post": false,
   "file": "37-scene-37.js",
   "start": 4658 / 24,
   "end": 4838 / 24,
   "mode": "illustrated",
   "loc": "LJ",
   "brief": "Scene 37 brief placeholder",
   "beats": [
    {
     "t": 0.29,
     "text": "tokdp tokio tokip tokbf tokcb tokiq tokcr tokaq tokaa tokcq tokir tokcv tokcw"
    },
    {
     "t": 4.71,
     "text": "tokay tokag tokcr tokam tokcs tokbo tokam tokcp"
    }
   ],
   "captions": [
    {
     "t0": 190.398,
     "t1": 194.168,
     "text": "Scene 37 caption 1 placeholder",
     "words": [
      [190.478, "tokaq"],
      [190.665, "tokbf"],
      [190.904, "tokde"],
      [191.205, "tokim"],
      [191.661, "tokam"],
      [191.848, "tokap"],
      [192.347, "tokin"],
      [192.876, "tokah"],
      [193.551, "tokai"]
     ]
    },
    {
     "t0": 194.298,
     "t1": 198.668,
     "text": "Scene 37 caption 2 placeholder",
     "words": [
      [194.378, "tokdp"],
      [194.684, "tokio"],
      [194.914, "tokip"],
      [195.382, "tokbf"],
      [195.908, "tokcb"],
      [195.918, "tokiq"],
      [196.386, "tokcr"],
      [196.616, "tokaq"],
      [196.922, "tokaa"],
      [196.989, "tokcq"],
      [197.476, "tokir"],
      [197.62, "tokcv"],
      [198.012, "tokcw"]
     ]
    },
    {
     "t0": 198.718,
     "t1": 201.598,
     "text": "Scene 37 caption 3 placeholder",
     "words": [
      [198.798, "tokay"],
      [198.992, "tokag"],
      [199.284, "tokcr"],
      [199.769, "tokam"],
      [200.352, "tokcs"],
      [200.547, "tokbo"],
      [200.935, "tokam"],
      [201.227, "tokcp"]
     ]
    }
   ]
  },
  {
   "id": "scene-38",
   "post": false,
   "file": "38-scene-38.js",
   "start": 4838 / 24,
   "end": 5031 / 24,
   "mode": "illustrated",
   "loc": "LJ",
   "brief": "Scene 38 brief placeholder",
   "beats": [
    {
     "t": 0.14,
     "text": "tokaa tokij tokcr tokaw tokcy tokbt tokdc tokfs tokbk tokam tokis"
    },
    {
     "t": 3.59,
     "text": "tokio tokit tokaq tokiu tokaz"
    },
    {
     "t": 6.44,
     "text": "tokcr tokiv tokag tokiw"
    }
   ],
   "captions": [
    {
     "t0": 198.718,
     "t1": 201.598,
     "text": "Scene 38 caption 1 placeholder",
     "words": [
      [198.798, "tokay"],
      [198.992, "tokag"],
      [199.284, "tokcr"],
      [199.769, "tokam"],
      [200.352, "tokcs"],
      [200.547, "tokbo"],
      [200.935, "tokam"],
      [201.227, "tokcp"]
     ]
    },
    {
     "t0": 201.648,
     "t1": 205.048,
     "text": "Scene 38 caption 2 placeholder",
     "words": [
      [201.728, "tokaa"],
      [201.923, "tokij"],
      [202.272, "tokcr"],
      [202.497, "tokaw"],
      [202.651, "tokcy"],
      [203.267, "tokbt"],
      [203.421, "tokdc"],
      [203.811, "tokfs"],
      [204.2, "tokbk"],
      [204.354, "tokam"],
      [204.58, "tokis"]
     ]
    },
    {
     "t0": 205.098,
     "t1": 207.878,
     "text": "Scene 38 caption 3 placeholder",
     "words": [
      [205.178, "tokio"],
      [205.515, "tokit"],
      [206.317, "tokaq"],
      [206.654, "tokiu"],
      [207.34, "tokaz"]
     ]
    },
    {
     "t0": 207.948,
     "t1": 209.718,
     "text": "Scene 38 caption 4 placeholder",
     "words": [
      [208.028, "tokcr"],
      [208.416, "tokiv"],
      [208.938, "tokag"],
      [209.325, "tokiw"]
     ]
    }
   ]
  },
  {
   "id": "scene-39",
   "post": false,
   "file": "39-scene-39.js",
   "start": 5031 / 24,
   "end": 5273 / 24,
   "mode": "illustrated",
   "loc": "LJ",
   "brief": "Scene 39 brief placeholder",
   "beats": [
    {
     "t": 0.22,
     "text": "tokhn tokiu tokix tokiy tokbh"
    },
    {
     "t": 2.48,
     "text": "tokiz tokja tokih tokio tokjb tokjc"
    },
    {
     "t": 5.63,
     "text": "tokaa tokfi tokjd tokcr tokfz tokam tokap"
    },
    {
     "t": 7.63,
     "text": "tokaa tokag tokje tokay tokae tokjf tokcl tokjg"
    }
   ],
   "captions": [
    {
     "t0": 207.948,
     "t1": 209.718,
     "text": "Scene 39 caption 1 placeholder",
     "words": [
      [208.028, "tokcr"],
      [208.416, "tokiv"],
      [208.938, "tokag"],
      [209.325, "tokiw"]
     ]
    },
    {
     "t0": 209.768,
     "t1": 211.968,
     "text": "Scene 39 caption 2 placeholder",
     "words": [
      [209.848, "tokhn"],
      [210.045, "tokiu"],
      [210.482, "tokix"],
      [211.254, "tokiy"],
      [211.476, "tokbh"]
     ]
    },
    {
     "t0": 212.028,
     "t1": 215.058,
     "text": "Scene 39 caption 3 placeholder",
     "words": [
      [212.108, "tokiz"],
      [212.456, "tokja"],
      [212.997, "tokih"],
      [213.754, "tokio"],
      [214.071, "tokjb"],
      [214.5, "tokjc"]
     ]
    },
    {
     "t0": 215.178,
     "t1": 217.128,
     "text": "Scene 39 caption 4 placeholder",
     "words": [
      [215.258, "tokaa"],
      [215.431, "tokfi"],
      [215.712, "tokjd"],
      [215.958, "tokcr"],
      [216.157, "tokfz"],
      [216.675, "tokam"],
      [216.712, "tokap"]
     ]
    },
    {
     "t0": 217.178,
     "t1": 219.507,
     "text": "Scene 39 caption 5 placeholder",
     "words": [
      [217.258, "tokaa"],
      [217.378, "tokag"],
      [217.554, "tokje"],
      [217.942, "tokay"],
      [218.044, "tokae"],
      [218.386, "tokjf"],
      [218.562, "tokcl"],
      [219.005, "tokjg"]
     ]
    }
   ]
  },
  {
   "id": "scene-40",
   "post": false,
   "file": "40-scene-40.js",
   "start": 5273 / 24,
   "end": 5418 / 24,
   "mode": "illustrated",
   "loc": "LK",
   "brief": "Scene 40 brief placeholder",
   "beats": [
    {
     "t": 0.56,
     "text": "tokhn tokft tokjh tokfn tokam tokji"
    },
    {
     "t": 2.57,
     "text": "tokaq tokjj tokjf tokcl tokjg tokcd tokac tokha tokjk tokbk tokam tokjl"
    }
   ],
   "captions": [
    {
     "t0": 220.185,
     "t1": 222.145,
     "text": "Scene 40 caption 1 placeholder",
     "words": [
      [220.265, "tokhn"],
      [220.488, "tokft"],
      [220.817, "tokjh"],
      [221.388, "tokfn"],
      [221.562, "tokam"],
      [221.756, "tokji"]
     ]
    },
    {
     "t0": 222.195,
     "t1": 225.805,
     "text": "Scene 40 caption 2 placeholder",
     "words": [
      [222.275, "tokaq"],
      [222.329, "tokjj"],
      [222.629, "tokjf"],
      [222.929, "tokcl"],
      [223.358, "tokjg"],
      [223.743, "tokcd"],
      [223.861, "tokac"],
      [223.947, "tokha"],
      [224.451, "tokjk"],
      [224.89, "tokbk"],
      [225.061, "tokam"],
      [225.201, "tokjl"]
     ]
    }
   ]
  },
  {
   "id": "scene-41",
   "post": false,
   "file": "41-scene-41.js",
   "start": 5418 / 24,
   "end": 5684 / 24,
   "mode": "illustrated",
   "loc": "LK",
   "brief": "Scene 41 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokaa tokjm tokaq tokjn tokez tokcr tokam tokap"
    },
    {
     "t": 3.41,
     "text": "tokjo tokjp tokio tokjb tokcm tokfx tokjq tokga tokjr"
    },
    {
     "t": 7.54,
     "text": "tokay tokjs tokam tokjt tokfb tokju tokao"
    },
    {
     "t": 9.97,
     "text": "tokcm tokaa tokdn tokcr"
    }
   ],
   "captions": [
    {
     "t0": 222.195,
     "t1": 225.805,
     "text": "Scene 41 caption 1 placeholder",
     "words": [
      [222.275, "tokaq"],
      [222.329, "tokjj"],
      [222.629, "tokjf"],
      [222.929, "tokcl"],
      [223.358, "tokjg"],
      [223.743, "tokcd"],
      [223.861, "tokac"],
      [223.947, "tokha"],
      [224.451, "tokjk"],
      [224.89, "tokbk"],
      [225.061, "tokam"],
      [225.201, "tokjl"]
     ]
    },
    {
     "t0": 225.925,
     "t1": 228.955,
     "text": "Scene 41 caption 2 placeholder",
     "words": [
      [226.005, "tokaa"],
      [226.205, "tokjm"],
      [226.605, "tokaq"],
      [226.872, "tokjn"],
      [227.405, "tokez"],
      [227.739, "tokcr"],
      [228.005, "tokam"],
      [228.272, "tokap"]
     ]
    },
    {
     "t0": 229.075,
     "t1": 233.085,
     "text": "Scene 41 caption 3 placeholder",
     "words": [
      [229.155, "tokjo"],
      [229.592, "tokjp"],
      [230.203, "tokio"],
      [230.552, "tokjb"],
      [230.989, "tokcm"],
      [231.338, "tokfx"],
      [231.513, "tokjq"],
      [231.949, "tokga"],
      [232.299, "tokjr"]
     ]
    },
    {
     "t0": 233.205,
     "t1": 235.515,
     "text": "Scene 41 caption 4 placeholder",
     "words": [
      [233.285, "tokay"],
      [233.438, "tokjs"],
      [233.793, "tokam"],
      [233.997, "tokjt"],
      [234.352, "tokfb"],
      [234.606, "tokju"],
      [235.013, "tokao"]
     ]
    },
    {
     "t0": 235.635,
     "t1": 236.915,
     "text": "Scene 41 caption 5 placeholder",
     "words": [
      [235.715, "tokcm"],
      [235.942, "tokaa"],
      [236.112, "tokdn"],
      [236.339, "tokcr"]
     ]
    }
   ]
  },
  {
   "id": "scene-42",
   "post": false,
   "file": "42-scene-42.js",
   "start": 5684 / 24,
   "end": 5894 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 42 brief placeholder",
   "beats": [
    {
     "t": 0.28,
     "text": "tokam tokjv tokgo tokio tokjw tokbt tokci tokaw tokam tokjx"
    },
    {
     "t": 3.32,
     "text": "tokjy tokam tokap tokev tokfd tokga tokjz tokaa tokdg"
    },
    {
     "t": 6.26,
     "text": "tokka tokkb tokkc tokio tokex tokid"
    }
   ],
   "captions": [
    {
     "t0": 235.635,
     "t1": 236.915,
     "text": "Scene 42 caption 1 placeholder",
     "words": [
      [235.715, "tokcm"],
      [235.942, "tokaa"],
      [236.112, "tokdn"],
      [236.339, "tokcr"]
     ]
    },
    {
     "t0": 237.035,
     "t1": 240.025,
     "text": "Scene 42 caption 2 placeholder",
     "words": [
      [237.115, "tokam"],
      [237.335, "tokjv"],
      [237.609, "tokgo"],
      [238.048, "tokio"],
      [238.268, "tokjw"],
      [238.597, "tokbt"],
      [238.817, "tokci"],
      [239.092, "tokaw"],
      [239.256, "tokam"],
      [239.476, "tokjx"]
     ]
    },
    {
     "t0": 240.075,
     "t1": 242.965,
     "text": "Scene 42 caption 3 placeholder",
     "words": [
      [240.155, "tokjy"],
      [240.519, "tokam"],
      [240.737, "tokap"],
      [241.028, "tokev"],
      [241.247, "tokfd"],
      [241.777, "tokga"],
      [241.902, "tokjz"],
      [242.411, "tokaa"],
      [242.556, "tokdg"]
     ]
    },
    {
     "t0": 243.015,
     "t1": 245.675,
     "text": "Scene 42 caption 4 placeholder",
     "words": [
      [243.095, "tokka"],
      [243.71, "tokkb"],
      [243.94, "tokkc"],
      [244.675, "tokio"],
      [244.84, "tokex"],
      [245.147, "tokid"]
     ]
    }
   ]
  },
  {
   "id": "scene-43",
   "post": false,
   "file": "43-scene-43.js",
   "start": 5894 / 24,
   "end": 6074 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 43 brief placeholder",
   "beats": [
    {
     "t": 0.27,
     "text": "tokhn tokkd tokaq tokit tokcd tokam tokke"
    },
    {
     "t": 3.88,
     "text": "tokaq tokcn tokhn tokgg tokid tokaw tokjl tokam tokap tokag tokkf"
    }
   ],
   "captions": [
    {
     "t0": 243.015,
     "t1": 245.675,
     "text": "Scene 43 caption 1 placeholder",
     "words": [
      [243.095, "tokka"],
      [243.71, "tokkb"],
      [243.94, "tokkc"],
      [244.675, "tokio"],
      [244.84, "tokex"],
      [245.147, "tokid"]
     ]
    },
    {
     "t0": 245.775,
     "t1": 248.615,
     "text": "Scene 43 caption 2 placeholder",
     "words": [
      [245.855, "tokhn"],
      [246.054, "tokkd"],
      [246.694, "tokaq"],
      [246.936, "tokit"],
      [247.488, "tokcd"],
      [247.598, "tokam"],
      [248.072, "tokke"]
     ]
    },
    {
     "t0": 249.385,
     "t1": 252.845,
     "text": "Scene 43 caption 3 placeholder",
     "words": [
      [249.465, "tokaq"],
      [249.706, "tokcn"],
      [250.007, "tokhn"],
      [250.308, "tokgg"],
      [250.609, "tokid"],
      [250.91, "tokaw"],
      [251.091, "tokjl"],
      [251.412, "tokam"],
      [251.652, "tokap"],
      [251.953, "tokag"],
      [252.194, "tokkf"]
     ]
    }
   ]
  },
  {
   "id": "scene-44",
   "post": false,
   "file": "44-scene-44.js",
   "start": 6074 / 24,
   "end": 6279 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 44 brief placeholder",
   "beats": [
    {
     "t": 0.61,
     "text": "tokbb tokkg tokbk tokam tokkh tokaq tokki"
    },
    {
     "t": 3.65,
     "text": "tokay tokag tokkf tokkj"
    },
    {
     "t": 5.38,
     "text": "tokam tokkk tokaa tokdn tokkl tokae tokaq tokkm tokkn tokae"
    }
   ],
   "captions": [
    {
     "t0": 253.615,
     "t1": 256.535,
     "text": "Scene 44 caption 1 placeholder",
     "words": [
      [253.695, "tokbb"],
      [254.223, "tokkg"],
      [254.601, "tokbk"],
      [254.827, "tokam"],
      [255.129, "tokkh"],
      [255.506, "tokaq"],
      [255.808, "tokki"]
     ]
    },
    {
     "t0": 256.655,
     "t1": 258.335,
     "text": "Scene 44 caption 2 placeholder",
     "words": [
      [256.735, "tokay"],
      [256.924, "tokag"],
      [257.176, "tokkf"],
      [257.491, "tokkj"]
     ]
    },
    {
     "t0": 258.385,
     "t1": 261.685,
     "text": "Scene 44 caption 3 placeholder",
     "words": [
      [258.465, "tokam"],
      [259.097, "tokkk"],
      [259.153, "tokaa"],
      [259.255, "tokdn"],
      [259.414, "tokkl"],
      [259.999, "tokae"],
      [260.362, "tokaq"],
      [260.511, "tokkm"],
      [260.808, "tokkn"],
      [261.106, "tokae"]
     ]
    }
   ]
  },
  {
   "id": "scene-45",
   "post": false,
   "file": "45-scene-45.js",
   "start": 6279 / 24,
   "end": 6559 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 45 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokiw tokko tokbt"
    },
    {
     "t": 1.92,
     "text": "tokkp tokkb tokkq tokio tokjb"
    },
    {
     "t": 4.09,
     "text": "tokkr tokks tokkt tokax tokku tokam tokkv"
    },
    {
     "t": 6.03,
     "text": "tokkw tokkx tokky tokas tokbx tokkz tokay"
    },
    {
     "t": 9.23,
     "text": "tokaw tokcr tokay tokag tokbx tokac tokap"
    }
   ],
   "captions": [
    {
     "t0": 258.385,
     "t1": 261.685,
     "text": "Scene 45 caption 1 placeholder",
     "words": [
      [258.465, "tokam"],
      [259.097, "tokkk"],
      [259.153, "tokaa"],
      [259.255, "tokdn"],
      [259.414, "tokkl"],
      [259.999, "tokae"],
      [260.362, "tokaq"],
      [260.511, "tokkm"],
      [260.808, "tokkn"],
      [261.106, "tokae"]
     ]
    },
    {
     "t0": 261.805,
     "t1": 263.415,
     "text": "Scene 45 caption 2 placeholder",
     "words": [
      [261.885, "tokiw"],
      [262.357, "tokko"],
      [262.751, "tokbt"]
     ]
    },
    {
     "t0": 263.465,
     "t1": 265.585,
     "text": "Scene 45 caption 3 placeholder",
     "words": [
      [263.545, "tokkp"],
      [264.014, "tokkb"],
      [264.249, "tokkq"],
      [264.562, "tokio"],
      [264.874, "tokjb"]
     ]
    },
    {
     "t0": 265.635,
     "t1": 267.525,
     "text": "Scene 45 caption 4 placeholder",
     "words": [
      [265.715, "tokkr"],
      [265.869, "tokks"],
      [266.245, "tokkt"],
      [266.475, "tokax"],
      [266.524, "tokku"],
      [266.793, "tokam"],
      [267.178, "tokkv"]
     ]
    },
    {
     "t0": 267.575,
     "t1": 270.725,
     "text": "Scene 45 caption 5 placeholder",
     "words": [
      [267.655, "tokkw"],
      [267.882, "tokkx"],
      [268.472, "tokky"],
      [268.812, "tokas"],
      [269.403, "tokbx"],
      [269.78, "tokkz"],
      [270.256, "tokay"]
     ]
    },
    {
     "t0": 270.775,
     "t1": 273.375,
     "text": "Scene 45 caption 6 placeholder",
     "words": [
      [270.855, "tokaw"],
      [271.106, "tokcr"],
      [271.439, "tokay"],
      [271.69, "tokag"],
      [272.024, "tokbx"],
      [272.441, "tokac"],
      [272.608, "tokap"]
     ]
    }
   ]
  },
  {
   "id": "scene-46",
   "post": false,
   "file": "46-scene-46.js",
   "start": 6559 / 24,
   "end": 6690 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 46 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokla toklb toklc tokio tokjb"
    },
    {
     "t": 2.63,
     "text": "tokld tokle tokga tokcc toklf tokfz tokac toklg tokap"
    }
   ],
   "captions": [
    {
     "t0": 270.775,
     "t1": 273.375,
     "text": "Scene 46 caption 1 placeholder",
     "words": [
      [270.855, "tokaw"],
      [271.106, "tokcr"],
      [271.439, "tokay"],
      [271.69, "tokag"],
      [272.024, "tokbx"],
      [272.441, "tokac"],
      [272.608, "tokap"]
     ]
    },
    {
     "t0": 273.475,
     "t1": 275.795,
     "text": "Scene 46 caption 2 placeholder",
     "words": [
      [273.555, "tokla"],
      [273.903, "toklb"],
      [274.112, "toklc"],
      [274.878, "tokio"],
      [275.157, "tokjb"]
     ]
    },
    {
     "t0": 275.845,
     "t1": 278.825,
     "text": "Scene 46 caption 3 placeholder",
     "words": [
      [275.925, "tokld"],
      [276.173, "tokle"],
      [276.256, "tokga"],
      [276.483, "tokcc"],
      [276.669, "toklf"],
      [277.165, "tokfz"],
      [277.672, "tokac"],
      [277.765, "toklg"],
      [278.271, "tokap"]
     ]
    }
   ]
  },
  {
   "id": "scene-47",
   "post": false,
   "file": "47-scene-47.js",
   "start": 6690 / 24,
   "end": 6922 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 47 brief placeholder",
   "beats": [
    {
     "t": 0.28,
     "text": "tokcc tokav tokbf toklh tokaa tokjd tokcr tokar"
    },
    {
     "t": 4.56,
     "text": "tokam tokfh tokck tokam tokel tokem tokam tokak tokgh tokid tokae tokay tokbk tokam tokli"
    }
   ],
   "captions": [
    {
     "t0": 275.845,
     "t1": 278.825,
     "text": "Scene 47 caption 1 placeholder",
     "words": [
      [275.925, "tokld"],
      [276.173, "tokle"],
      [276.256, "tokga"],
      [276.483, "tokcc"],
      [276.669, "toklf"],
      [277.165, "tokfz"],
      [277.672, "tokac"],
      [277.765, "toklg"],
      [278.271, "tokap"]
     ]
    },
    {
     "t0": 278.945,
     "t1": 283.095,
     "text": "Scene 47 caption 2 placeholder",
     "words": [
      [279.025, "tokcc"],
      [279.265, "tokav"],
      [280.124, "tokbf"],
      [280.49, "toklh"],
      [281.349, "tokaa"],
      [281.589, "tokjd"],
      [282.081, "tokcr"],
      [282.448, "tokar"]
     ]
    },
    {
     "t0": 283.225,
     "t1": 288.495,
     "text": "Scene 47 caption 3 placeholder",
     "words": [
      [283.305, "tokam"],
      [283.58, "tokfh"],
      [284.213, "tokck"],
      [284.244, "tokam"],
      [284.529, "tokel"],
      [284.761, "tokem"],
      [285.331, "tokam"],
      [285.574, "tokak"],
      [286.217, "tokgh"],
      [286.629, "tokid"],
      [286.956, "tokae"],
      [287.104, "tokay"],
      [287.515, "tokbk"],
      [287.568, "tokam"],
      [287.758, "tokli"]
     ]
    }
   ]
  },
  {
   "id": "scene-48",
   "post": false,
   "file": "48-scene-48.js",
   "start": 6922 / 24,
   "end": 7156 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 48 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokjo toklj tokag tokfi tokam tokdz tokea tokeb"
    },
    {
     "t": 3.59,
     "text": "tokay tokag tokam toklk tokll tokaq toklh tokay tokab tokaw toklm tokay tokbo tokam tokli"
    },
    {
     "t": 8.4,
     "text": "tokaw tokam tokln"
    }
   ],
   "captions": [
    {
     "t0": 283.225,
     "t1": 288.495,
     "text": "Scene 48 caption 1 placeholder",
     "words": [
      [283.305, "tokam"],
      [283.58, "tokfh"],
      [284.213, "tokck"],
      [284.244, "tokam"],
      [284.529, "tokel"],
      [284.761, "tokem"],
      [285.331, "tokam"],
      [285.574, "tokak"],
      [286.217, "tokgh"],
      [286.629, "tokid"],
      [286.956, "tokae"],
      [287.104, "tokay"],
      [287.515, "tokbk"],
      [287.568, "tokam"],
      [287.758, "tokli"]
     ]
    },
    {
     "t0": 288.595,
     "t1": 291.845,
     "text": "Scene 48 caption 2 placeholder",
     "words": [
      [288.675, "tokjo"],
      [288.859, "toklj"],
      [289.261, "tokag"],
      [289.582, "tokfi"],
      [289.904, "tokam"],
      [290.145, "tokdz"],
      [290.707, "tokea"],
      [291.27, "tokeb"]
     ]
    },
    {
     "t0": 291.925,
     "t1": 296.685,
     "text": "Scene 48 caption 3 placeholder",
     "words": [
      [292.005, "tokay"],
      [292.187, "tokag"],
      [292.429, "tokam"],
      [292.671, "toklk"],
      [293.034, "tokll"],
      [293.398, "tokaq"],
      [293.64, "toklh"],
      [294.003, "tokay"],
      [294.185, "tokab"],
      [294.487, "tokaw"],
      [294.669, "toklm"],
      [295.032, "tokay"],
      [295.214, "tokbo"],
      [295.517, "tokam"],
      [295.759, "tokli"]
     ]
    },
    {
     "t0": 296.735,
     "t1": 297.915,
     "text": "Scene 48 caption 4 placeholder",
     "words": [
      [296.815, "tokaw"],
      [297.074, "tokam"],
      [297.505, "tokln"]
     ]
    }
   ]
  },
  {
   "id": "scene-49",
   "post": false,
   "file": "49-scene-49.js",
   "start": 7156 / 24,
   "end": 7316 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 49 brief placeholder",
   "beats": [
    {
     "t": 0.6,
     "text": "tokay tokag toklo tokga tokfx tokag toklp tokae tokaa tokjb"
    },
    {
     "t": 3.91,
     "text": "tokam tokap tokag tokbx tokac toklq tokao tokkr tokjq tokae tokga"
    }
   ],
   "captions": [
    {
     "t0": 298.685,
     "t1": 301.945,
     "text": "Scene 49 caption 1 placeholder",
     "words": [
      [298.765, "tokay"],
      [298.98, "tokag"],
      [299.194, "toklo"],
      [299.915, "tokga"],
      [299.993, "tokfx"],
      [300.149, "tokag"],
      [300.344, "toklp"],
      [300.88, "tokae"],
      [301.27, "tokaa"],
      [301.396, "tokjb"]
     ]
    },
    {
     "t0": 301.995,
     "t1": 304.895,
     "text": "Scene 49 caption 2 placeholder",
     "words": [
      [302.075, "tokam"],
      [302.466, "tokap"],
      [302.63, "tokag"],
      [302.836, "tokbx"],
      [303.114, "tokac"],
      [303.165, "toklq"],
      [303.597, "tokao"],
      [303.731, "tokkr"],
      [303.875, "tokjq"],
      [304.142, "tokae"],
      [304.348, "tokga"]
     ]
    }
   ]
  },
  {
   "id": "scene-50",
   "post": false,
   "file": "50-scene-50.js",
   "start": 7316 / 24,
   "end": 7554 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 50 brief placeholder",
   "beats": [
    {
     "t": 0.26,
     "text": "tokaq tokae tokam tokbg toklr tokio tokcq tokaf tokay tokdn tokls toklt tokbt"
    },
    {
     "t": 4.6,
     "text": "tokfx tokfi toklu tokio tokjb"
    },
    {
     "t": 7.19,
     "text": "toklv tokga toklw toklb"
    },
    {
     "t": 8.64,
     "text": "tokfx toklw tokga"
    }
   ],
   "captions": [
    {
     "t0": 301.995,
     "t1": 304.895,
     "text": "Scene 50 caption 1 placeholder",
     "words": [
      [302.075, "tokam"],
      [302.466, "tokap"],
      [302.63, "tokag"],
      [302.836, "tokbx"],
      [303.114, "tokac"],
      [303.165, "toklq"],
      [303.597, "tokao"],
      [303.731, "tokkr"],
      [303.875, "tokjq"],
      [304.142, "tokae"],
      [304.348, "tokga"]
     ]
    },
    {
     "t0": 305.015,
     "t1": 309.235,
     "text": "Scene 50 caption 2 placeholder",
     "words": [
      [305.095, "tokaq"],
      [305.352, "tokae"],
      [305.609, "tokam"],
      [305.866, "tokbg"],
      [306.251, "toklr"],
      [306.573, "tokio"],
      [306.83, "tokcq"],
      [307.087, "tokaf"],
      [307.408, "tokay"],
      [307.6, "tokdn"],
      [307.857, "tokls"],
      [308.307, "toklt"],
      [308.628, "tokbt"]
     ]
    },
    {
     "t0": 309.355,
     "t1": 311.835,
     "text": "Scene 50 caption 3 placeholder",
     "words": [
      [309.435, "tokfx"],
      [309.582, "tokfi"],
      [310.021, "toklu"],
      [310.826, "tokio"],
      [311.119, "tokjb"]
     ]
    },
    {
     "t0": 311.945,
     "t1": 313.275,
     "text": "Scene 50 caption 4 placeholder",
     "words": [
      [312.025, "toklv"],
      [312.235, "tokga"],
      [312.702, "toklw"],
      [312.853, "toklb"]
     ]
    },
    {
     "t0": 313.395,
     "t1": 314.595,
     "text": "Scene 50 caption 5 placeholder",
     "words": [
      [313.475, "tokfx"],
      [313.585, "toklw"],
      [314.025, "tokga"]
     ]
    }
   ]
  },
  {
   "id": "scene-51",
   "post": false,
   "file": "51-scene-51.js",
   "start": 7554 / 24,
   "end": 7740 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 51 brief placeholder",
   "beats": [
    {
     "t": 0.5,
     "text": "tokhi tokaa tokip tokaw toklx tokcr"
    },
    {
     "t": 2.39,
     "text": "tokly toklz tokbk tokam tokma tokkh"
    },
    {
     "t": 5.58,
     "text": "tokam tokji tokdn tokmb tokay tokid"
    }
   ],
   "captions": [
    {
     "t0": 315.165,
     "t1": 316.935,
     "text": "Scene 51 caption 1 placeholder",
     "words": [
      [315.245, "tokhi"],
      [315.382, "tokaa"],
      [315.519, "tokip"],
      [315.93, "tokaw"],
      [316.067, "toklx"],
      [316.478, "tokcr"]
     ]
    },
    {
     "t0": 317.055,
     "t1": 319.665,
     "text": "Scene 51 caption 2 placeholder",
     "words": [
      [317.135, "tokly"],
      [317.807, "toklz"],
      [318.516, "tokbk"],
      [318.684, "tokam"],
      [318.898, "tokma"],
      [319.141, "tokkh"]
     ]
    },
    {
     "t0": 320.245,
     "t1": 322.435,
     "text": "Scene 51 caption 3 placeholder",
     "words": [
      [320.325, "tokam"],
      [320.647, "tokji"],
      [321.278, "tokdn"],
      [321.301, "tokmb"],
      [321.864, "tokay"],
      [321.944, "tokid"]
     ]
    }
   ]
  },
  {
   "id": "scene-52",
   "post": false,
   "file": "52-scene-52.js",
   "start": 7740 / 24,
   "end": 8036 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 52 brief placeholder",
   "beats": [
    {
     "t": 0.39,
     "text": "tokct tokaj tokap tokaa tokjb tokmc tokay tokmd tokcr tokme"
    },
    {
     "t": 3.98,
     "text": "tokmf tokfx tokmg tokmh"
    },
    {
     "t": 5.92,
     "text": "tokio tokab tokbf tokmi tokcd tokcr tokmj"
    },
    {
     "t": 8.27,
     "text": "tokbb tokmk tokml tokae tokmm tokmn"
    }
   ],
   "captions": [
    {
     "t0": 322.805,
     "t1": 326.345,
     "text": "Scene 52 caption 1 placeholder",
     "words": [
      [322.885, "tokct"],
      [323.168, "tokaj"],
      [323.461, "tokap"],
      [323.968, "tokaa"],
      [324.115, "tokjb"],
      [324.886, "tokmc"],
      [325.168, "tokay"],
      [325.276, "tokmd"],
      [325.569, "tokcr"],
      [325.783, "tokme"]
     ]
    },
    {
     "t0": 326.395,
     "t1": 328.265,
     "text": "Scene 52 caption 2 placeholder",
     "words": [
      [326.475, "tokmf"],
      [327.469, "tokfx"],
      [327.618, "tokmg"],
      [327.8, "tokmh"]
     ]
    },
    {
     "t0": 328.335,
     "t1": 330.625,
     "text": "Scene 52 caption 3 placeholder",
     "words": [
      [328.415, "tokio"],
      [328.655, "tokab"],
      [328.955, "tokbf"],
      [329.195, "tokmi"],
      [329.495, "tokcd"],
      [329.675, "tokcr"],
      [329.915, "tokmj"]
     ]
    },
    {
     "t0": 330.685,
     "t1": 334.173,
     "text": "Scene 52 caption 4 placeholder",
     "words": [
      [330.765, "tokbb"],
      [331.739, "tokmk"],
      [332.415, "tokml"],
      [332.605, "tokae"],
      [333.02, "tokmm"],
      [333.578, "tokmn"]
     ]
    }
   ]
  },
  {
   "id": "scene-53",
   "post": false,
   "file": "53-scene-53.js",
   "start": 8036 / 24,
   "end": 8156 / 24,
   "mode": "illustrated",
   "loc": "LL",
   "brief": "Scene 53 brief placeholder",
   "beats": [],
   "captions": []
  }
 ],
 "cues": [
  {
   "t": 0,
   "kind": "open"
  },
  {
   "t": 22.4,
   "kind": "burst"
  }
 ]
};
