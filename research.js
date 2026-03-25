/* =====================================================================
   Alien Radio — TV & Radio Entertainment Research Article Generator
   research.js — generates full academic-style research articles about
   vintage TV shows, classic radio, and entertainment history.
   Includes links to YouTube, Archive.org, and other viewing/listening
   resources.  Adapted from www-infinity/Bitcoin-Crusher research.js
   ===================================================================== */
/* global window */
window.RESEARCH = (() => {
  'use strict';

  /* ------------------------------------------------------------------
     TOPIC LIBRARY — Vintage TV Shows & Classic Radio
  ------------------------------------------------------------------ */
  const TOPICS = [
    {
      id: 'northern-exposure',
      title: 'Northern Exposure',
      subtitle: 'Community, Isolation, and the Frontier Spirit in Cicely, Alaska',
      era: '1990–1995', medium: 'Television', network: 'CBS',
      tags: ['dramedy', 'Alaska', 'small-town', '90s TV'],
      abstract: 'Northern Exposure (1990–1995) stands as one of television\'s most philosophically rich dramedies. Set in the fictional Alaskan town of Cicely, the series follows New York physician Joel Fleischman as he navigates life among a cast of eccentric but deeply humane characters. The show\'s success lies in its gentle collision of urban sophistication and frontier simplicity, its respect for indigenous Tlingit and Athabascan cultures, and its meditative tone unusual for prime-time network television.',
      sections: [
        { heading: 'Historical Context', body: 'CBS greenlit the pilot in 1990 following the success of quirky regional dramas. Co-creators Joshua Brand and John Falsey drew on the real isolation of rural Alaskan communities, particularly the challenges of the WAMI (Western Alaska Medical Improvement) program that stationed young doctors in remote villages.' },
        { heading: 'Cultural Significance', body: 'The series was among the first to feature recurring Native Alaskan characters played by Native Alaskan actors, including Elaine Miles (Marilyn Whirlwind) and the late John Cullum\'s Ed Chigliak narrative arc. Critics of the era praised its refusal to treat indigenous culture as mere scenic backdrop.' },
        { heading: 'Radio Within the Show: KBHR', body: 'A pivotal narrative device was the fictional radio station KBHR 570 AM, hosted by philosophically-minded DJ Chris Stevens (John Corbett). Stevens\'s on-air monologues — quoting Chekhov, Whitman, Rilke, and Carl Jung — blurred the line between small-town DJ and itinerant intellectual. The radio motif mirrors the show\'s broader meditation on communication across cultural distances.' },
        { heading: 'Legacy and Influence', body: 'Northern Exposure won the Emmy Award for Outstanding Drama Series in 1992 and earned praise from viewers who felt underserved by mainstream network fare. It paved the way for subsequent "quirky small-town" series including Picket Fences, Gilmore Girls, and Schitt\'s Creek.' },
      ],
      links: [
        { label: '▶ Watch on Archive.org', url: 'https://archive.org/search?query=northern+exposure+TV' },
        { label: '▶ Northern Exposure Pilot on YouTube', url: 'https://www.youtube.com/results?search_query=northern+exposure+pilot+1990' },
        { label: '📄 Wikipedia: Northern Exposure', url: 'https://en.wikipedia.org/wiki/Northern_Exposure' },
      ],
    },
    {
      id: 'twin-peaks',
      title: 'Twin Peaks',
      subtitle: 'Surrealism, Small-Town Noir, and the Dream Logic of David Lynch',
      era: '1990–1991, 2017', medium: 'Television', network: 'ABC / Showtime',
      tags: ['surrealism', 'noir', 'Lynch', '90s TV', 'Pacific Northwest'],
      abstract: 'Twin Peaks (1990–1991) shattered the conventions of American prime-time television through the co-creation of David Lynch and Mark Frost. The murder mystery of Laura Palmer became a vessel for Lynch\'s signature dreamlike imagery, non-linear time, and exploration of the darkness beneath suburban normalcy. The show\'s cultural fingerprint is measurable in virtually every prestige TV drama that followed.',
      sections: [
        { heading: 'Origins and Development', body: 'Lynch and Frost conceived the series from Lynch\'s longstanding fascination with the contradictions of small-town American life — the same terrain explored in Blue Velvet (1986). ABC initially expressed concern about the show\'s deliberately slow pacing but greenlighted it following the success of Lynch\'s film work.' },
        { heading: 'Sound Design and Music', body: 'Angelo Badalamenti\'s iconic score — brooding jazz, reverb-drenched guitar, and the now-legendary "Laura Palmer\'s Theme" — was as central to the show\'s identity as its visuals. The soundtrack album reached the Billboard 200 and introduced ambient/noir scoring to mainstream television audiences.' },
        { heading: 'The Black Lodge and Mythology', body: 'The show\'s mythology, rooted in the spiritual warfare of the Black Lodge and White Lodge, drew on Theosophical traditions, Native American cosmology, and the occult imagery of Francis Bacon\'s paintings. Agent Dale Cooper\'s (Kyle MacLachlan) use of dream sequences and Tibetan Buddhist deductive reasoning methods was wholly unprecedented in procedural drama.' },
        { heading: 'Legacy: Twin Peaks: The Return (2017)', body: 'The 2017 18-part revival on Showtime, directed by Lynch in its entirety, is widely regarded by critics as among the most ambitious works in television history — more film essay than serial drama. It fundamentally challenged what the television format could contain.' },
      ],
      links: [
        { label: '▶ Twin Peaks Pilot on YouTube', url: 'https://www.youtube.com/results?search_query=twin+peaks+pilot+1990' },
        { label: '🎵 Angelo Badalamenti Twin Peaks Theme', url: 'https://www.youtube.com/results?search_query=twin+peaks+theme+badalamenti' },
        { label: '📄 Wikipedia: Twin Peaks', url: 'https://en.wikipedia.org/wiki/Twin_Peaks' },
      ],
    },
    {
      id: 'orson-welles-radio',
      title: 'Orson Welles and the Golden Age of Radio Drama',
      subtitle: 'The Mercury Theatre on the Air and the War of the Worlds Broadcast (1938)',
      era: '1930s–1940s', medium: 'Radio', network: 'CBS Radio',
      tags: ['radio drama', 'Golden Age', 'Orson Welles', 'Mercury Theatre', '1938'],
      abstract: 'The Mercury Theatre on the Air represents the apex of radio drama as a serious artistic form. Under the creative leadership of Orson Welles, CBS broadcasts in 1938–1939 produced adaptations of literary classics that exploited the unique intimacy and imaginative power of the medium. The October 30, 1938 broadcast of H.G. Wells\'s War of the Worlds remains the most discussed single radio event in American cultural history.',
      sections: [
        { heading: 'The Mercury Theatre on the Air', body: 'The Mercury Theatre was Welles\'s repertory company, formed in 1937. CBS gave the troupe a Sunday evening slot, allowing Welles and writer Howard Koch to adapt works by Bram Stoker, H.G. Wells, Thorton Wilder, Jules Verne, and others. The production team pioneered techniques — overlapping dialogue, ambient sound design, manipulated playback speeds — that would define radio drama for decades.' },
        { heading: 'War of the Worlds: The Broadcast', body: 'The Halloween 1938 broadcast adapted H.G. Wells\'s Martian invasion novel as a simulated CBS news bulletin, complete with fake reporter interviews and official-sounding announcements from a fictional "Secretary of the Interior." The realistic news format — novel at the time — led a percentage of listeners who tuned in late to believe an actual invasion was underway. Newspaper front pages the following morning were dominated by reports of public panic.' },
        { heading: 'The Reality of the Panic', body: 'Subsequent scholarly research, particularly Hadley Cantril\'s landmark 1940 study "The Invasion from Mars: A Study in the Psychology of Panic," established that the panic was real but limited in scope. The episode became a foundational case study in mass media psychology, agenda-setting theory, and the power of realistic framing.' },
        { heading: 'Archival Listening', body: 'The complete 1938 broadcast survives in excellent audio quality and has been digitized by Archive.org. It remains one of the most accessible primary documents in broadcast history.' },
      ],
      links: [
        { label: '▶ War of the Worlds 1938 Full Broadcast (Archive.org)', url: 'https://archive.org/details/OrsonWellesWarOfTheWorldsOriginalBroadcast10301938' },
        { label: '▶ Mercury Theatre on Archive.org', url: 'https://archive.org/search?query=mercury+theatre+on+the+air+orson+welles' },
        { label: '📄 Wikipedia: The War of the Worlds (radio drama)', url: 'https://en.wikipedia.org/wiki/The_War_of_the_Worlds_(1938_radio_drama)' },
      ],
    },
    {
      id: 'twilight-zone',
      title: 'The Twilight Zone',
      subtitle: 'Rod Serling, Social Allegory, and the Anatomy of American Anxiety',
      era: '1959–1964', medium: 'Television', network: 'CBS',
      tags: ['science fiction', 'anthology', 'Rod Serling', 'social commentary', '60s TV'],
      abstract: 'Rod Serling\'s The Twilight Zone (1959–1964) represents the most durable anthology drama in American television history. Operating under the cover of science fiction and fantasy, Serling used the series to address McCarthyism, nuclear fear, racial inequality, and conformity — subjects the networks\' sponsors would have blocked in more realistic formats. The series\' five-season run produced 156 episodes, many of which remain touchstones of American popular culture.',
      sections: [
        { heading: 'Serling\'s Method: Allegory as Armor', body: 'Serling had been repeatedly censored as a dramatic writer for CBS plays that addressed racial violence and political corruption directly. His insight was that placing social criticism inside science fiction scenarios neutered sponsor objections. "I was not permitted to have Negroes and whites in conflict on the screen," he later explained, "so I substituted aliens and humans."' },
        { heading: 'Notable Episodes and Their Context', body: '"The Monsters Are Due on Maple Street" (1960) dramatized McCarthyite paranoia through a suburban community that tears itself apart hunting for alien infiltrators. "Eye of the Beholder" (1960) presented a world where "beauty" is defined by fascist conformity. "To Serve Man" (1962) — arguably the most quoted episode in the canon — used alien cookbook imagery to comment on naïve trust in authority.' },
        { heading: 'Technical Innovation', body: 'The Twilight Zone pioneered the use of the half-hour dramatic format for adult science fiction, influencing the British anthology tradition (Out of the Unknown, Black Mirror) and inspiring generations of writers including Stephen King, Neil Gaiman, and Jordan Peele.' },
        { heading: 'The Bernard Herrmann Scores', body: 'Composer Bernard Herrmann contributed several scores to the original series, including the iconic main theme later arranged by Marius Constant. The series\' music budget, unusually generous for television of the era, produced some of the finest small-ensemble dramatic scoring in broadcast history.' },
      ],
      links: [
        { label: '▶ Twilight Zone episodes on Archive.org', url: 'https://archive.org/search?query=twilight+zone+rod+serling' },
        { label: '▶ YouTube: Twilight Zone full episodes', url: 'https://www.youtube.com/results?search_query=twilight+zone+full+episodes+1959' },
        { label: '📄 Wikipedia: The Twilight Zone (1959)', url: 'https://en.wikipedia.org/wiki/The_Twilight_Zone_(1959_TV_series)' },
      ],
    },
    {
      id: 'the-x-files',
      title: 'The X-Files',
      subtitle: 'Paranoia, Government Conspiracy, and the Epistemology of Belief',
      era: '1993–2018', medium: 'Television', network: 'Fox',
      tags: ['sci-fi', 'conspiracy', '90s TV', 'FBI', 'paranormal'],
      abstract: 'Chris Carter\'s The X-Files (1993–2002, revived 2016/2018) captured the post-Cold War mood of institutional distrust and channeled it into one of television\'s most sophisticated long-form mythologies. The partnership of believer Fox Mulder (David Duchovny) and scientific skeptic Dana Scully (Gillian Anderson) became an epistemological debate machine, exploring how evidence and belief interact under conditions of deliberate obfuscation.',
      sections: [
        { heading: 'The Monster-of-the-Week vs. Mythology Arc', body: 'Carter and his writers developed a dual structure: standalone "monster-of-the-week" episodes (often written by Vince Gilligan and Darin Morgan) explored specific paranormal phenomena, while the mythology arc tracked an elaborate government-alien conspiracy. The monster-of-the-week episodes are now widely considered the stronger work, anticipating the anthology-drama revival.' },
        { heading: 'The Scully Effect', body: 'Gillian Anderson\'s portrayal of Dr. Dana Scully — a medical doctor and forensic expert, rational and self-possessed — is credited with measurably increasing female enrollment in science and medicine programs in the late 1990s. The phenomenon, documented by the Geena Davis Institute on Gender in Media, was dubbed "The Scully Effect."' },
        { heading: '90s Conspiracy Culture', body: 'The show\'s success was inseparable from the broader 1990s climate of institutional distrust following the end of the Cold War, the Oklahoma City bombing, the Waco siege, and the persistent cultural aftershocks of Watergate. "Trust No One" resonated as both entertainment and genuine sociological condition.' },
        { heading: 'Visual Style and Vancouver', body: 'The first five seasons were filmed almost entirely in Vancouver, British Columbia, which stood in for the rainy, fog-shrouded exteriors that became the show\'s visual signature. Cinematographer John Bartley developed a high-contrast, shadow-heavy style that influenced virtually every supernatural drama that followed.' },
      ],
      links: [
        { label: '▶ X-Files clips on YouTube', url: 'https://www.youtube.com/results?search_query=x+files+best+episodes' },
        { label: '📄 Wikipedia: The X-Files', url: 'https://en.wikipedia.org/wiki/The_X-Files' },
        { label: '📄 The Scully Effect (Geena Davis Institute)', url: 'https://seejane.org/research-informs-empowers/the-scully-effect/' },
      ],
    },
    {
      id: 'golden-age-radio',
      title: 'The Golden Age of American Radio',
      subtitle: 'Network Broadcasting, 1920–1960: From KDKA Pittsburgh to the Transistor Revolution',
      era: '1920–1960', medium: 'Radio', network: 'NBC / CBS / ABC',
      tags: ['radio history', 'Golden Age', 'broadcasting', 'NBC', 'CBS'],
      abstract: 'The period between the first commercial broadcast by KDKA Pittsburgh in November 1920 and the widespread adoption of television in the mid-1950s constitutes radio\'s Golden Age — an era in which the medium was the dominant force in American entertainment, news delivery, and political communication. The era produced enduring innovations in drama, comedy, journalism, and music programming that shaped all subsequent broadcast media.',
      sections: [
        { heading: 'KDKA and the First Commercial Broadcast', body: 'On November 2, 1920, KDKA Pittsburgh broadcast the results of the Harding-Cox presidential election, widely regarded as the first scheduled commercial radio broadcast in the United States. Within two years, the Radio Corporation of America (RCA) had established the National Broadcasting Company (NBC), creating the template for network radio.' },
        { heading: 'Radio Drama and Comedy', body: 'The 1930s and 40s produced an extraordinary range of radio programming. Jack Benny\'s show ran from 1932–1955. The Lone Ranger debuted in 1933 on WXYZ Detroit. Suspense (1942–1962) featured nearly every major Hollywood actor of the era. The Adventures of Superman (1940–1951) invented the sonic conventions of superhero storytelling.' },
        { heading: 'FDR\'s Fireside Chats', body: 'President Franklin Roosevelt\'s 30 fireside chats between 1933 and 1944 demonstrated radio\'s unprecedented political power. Roosevelt used the intimate quality of radio — which entered American homes and positioned the president as a household voice — to build popular support for the New Deal and, later, for US involvement in World War II.' },
        { heading: 'The Transistor and Radio\'s Reinvention', body: 'Television\'s rise in the late 1940s and 1950s displaced radio as the dominant home entertainment medium. Radio reinvented itself around music formats — Top 40, R&B, Country — driven by the portability of the transistor radio (introduced commercially in 1954). This reinvention produced rock and roll radio culture.' },
      ],
      links: [
        { label: '▶ KDKA 1920 broadcast recreation (Archive.org)', url: 'https://archive.org/search?query=KDKA+1920+radio' },
        { label: '▶ Jack Benny Radio Show (Archive.org)', url: 'https://archive.org/search?query=jack+benny+radio+show' },
        { label: '▶ FDR Fireside Chats (Archive.org)', url: 'https://archive.org/search?query=FDR+fireside+chats' },
        { label: '📄 Wikipedia: Golden Age of Radio', url: 'https://en.wikipedia.org/wiki/Golden_Age_of_American_radio' },
      ],
    },
    {
      id: 'mash',
      title: 'M*A*S*H',
      subtitle: 'Anti-War Satire, Medical Ethics, and Television\'s Longest Goodbye',
      era: '1972–1983', medium: 'Television', network: 'CBS',
      tags: ['comedy-drama', 'Korean War', 'anti-war', '70s TV', '80s TV'],
      abstract: 'M*A*S*H (1972–1983) occupies a singular position in American television history as a sustained anti-war comedy-drama set in a Korean War surgical unit that used its Korean War setting as a transparent metaphor for the Vietnam War. Its series finale, "Goodbye, Farewell and Amen" (1983), drew 106 million viewers — still the most-watched single television broadcast in US history. The series redefined what comedy-drama could do with grief, trauma, and institutional critique.',
      sections: [
        { heading: 'The Film → Series Transition', body: 'Robert Altman\'s 1970 film adaptation of Richard Hooker\'s novel provided the template but the TV series, developed by Larry Gelbart for CBS, substantially evolved the material. Where Altman\'s film deployed anarchic, overlapping dialogue and satirical black comedy, Gelbart\'s series developed longer story arcs and deeper character psychology across its eleven seasons.' },
        { heading: 'The Laugh Track Debate', body: 'Creator Larry Gelbart fought unsuccessfully against CBS\'s insistence on a studio laugh track for the opening seasons. As the series matured, CBS permitted the laugh track to be removed from surgical scenes — a small but symbolically significant victory that acknowledged the incompatibility of canned laughter with suffering.' },
        { heading: 'The Alan Alda Era and Cultural Shift', body: 'Alan Alda\'s Hawkeye Pierce evolved from lovable rogue to a deeply traumatized figure wrestling with moral exhaustion. The final seasons — particularly the season 11 finale — are among the darkest and most psychologically complex television produced in the network era.' },
        { heading: 'The Finale: By the Numbers', body: 'The February 28, 1983 finale was watched by a then-unprecedented 106 million Americans (on a US population of ~233 million). The New York City water system experienced pressure drops during commercial breaks as millions simultaneously flushed toilets or used kitchen faucets — one of the most cited anecdotes in broadcast history.' },
      ],
      links: [
        { label: '▶ M*A*S*H clips on YouTube', url: 'https://www.youtube.com/results?search_query=MASH+TV+series+classic+scenes' },
        { label: '📄 Wikipedia: M*A*S*H (TV series)', url: 'https://en.wikipedia.org/wiki/M*A*S*H_(TV_series)' },
        { label: '▶ Archive.org: M*A*S*H', url: 'https://archive.org/search?query=MASH+TV+series' },
      ],
    },
    {
      id: 'star-trek-tos',
      title: 'Star Trek: The Original Series',
      subtitle: 'Gene Roddenberry, Utopian Futurism, and the Politics of the Final Frontier',
      era: '1966–1969', medium: 'Television', network: 'NBC',
      tags: ['science fiction', 'space opera', 'Gene Roddenberry', '60s TV', 'social commentary'],
      abstract: 'Gene Roddenberry\'s Star Trek (1966–1969) articulated a vision of a secular, racially integrated, militarily pacifist human future at the height of the Cold War, the Civil Rights Movement, and the Vietnam War. Though cancelled after three seasons due to low ratings, the series became one of the most commercially and culturally significant television franchises in history through syndication, producing six spin-off series and thirteen theatrical films.',
      sections: [
        { heading: 'Roddenberry\'s Humanist Vision', body: 'Roddenberry, a WWII bomber pilot turned TV writer, designed the Enterprise crew as a deliberate utopian projection: a Black woman (Lt. Uhura) and a Japanese-American man (Mr. Sulu) as bridge officers in 1966, when NBC executives objected to both; a Vulcan first officer (Mr. Spock) as the show\'s most popular character. The series\' progressive casting was a conscious political statement.' },
        { heading: 'Social Allegory in Deep Space', body: 'Like The Twilight Zone, Star Trek used science fiction settings to critique contemporary American society. "Let That Be Your Last Battlefield" (1969) allegorized racial bigotry through two aliens distinguished only by which side of their face is black or white. "A Private Little War" (1968) directly addressed the Vietnam War through a conflict between two alien factions armed by competing superpowers.' },
        { heading: 'The First Interracial Kiss on US Television', body: 'The November 1968 episode "Plato\'s Stepchildren" featured what is generally cited as the first interracial kiss on American network television, between Captain Kirk (William Shatner) and Lt. Uhura (Nichelle Nichols). NBC received both hate mail and record positive feedback.' },
        { heading: 'Syndication and the Fanbase', body: 'After cancellation in 1969, Star Trek entered syndication and built an unprecedented fan (or "fandom") community that wrote fanzines, organized conventions, and lobbied Paramount for revival. It is among the first documented examples of sustained organized fan activism producing a commercial result: Star Trek: The Motion Picture (1979).' },
      ],
      links: [
        { label: '▶ Star Trek TOS on YouTube', url: 'https://www.youtube.com/results?search_query=star+trek+original+series+1966+episode' },
        { label: '▶ Archive.org: Star Trek', url: 'https://archive.org/search?query=star+trek+original+series' },
        { label: '📄 Wikipedia: Star Trek: The Original Series', url: 'https://en.wikipedia.org/wiki/Star_Trek:_The_Original_Series' },
      ],
    },
    {
      id: 'radio-free-europe',
      title: 'Radio Free Europe / Radio Liberty',
      subtitle: 'Cold War Broadcasting, Information Warfare, and the Voice Behind the Iron Curtain',
      era: '1950–present', medium: 'Radio', network: 'RFE/RL (CIA / US Government)',
      tags: ['cold war', 'propaganda', 'shortwave', 'Iron Curtain', 'freedom of press'],
      abstract: 'Radio Free Europe (RFE, founded 1949) and Radio Liberty (RL, founded 1953) were covertly CIA-funded shortwave radio stations broadcasting news and cultural programming into Soviet-controlled Eastern Europe and the USSR. As the primary source of uncensored information for millions of listeners behind the Iron Curtain, they played a measurable role in undermining Soviet legitimacy and supporting dissident movements through four decades of Cold War.',
      sections: [
        { heading: 'Origins and CIA Funding', body: 'RFE was established by the National Committee for a Free Europe, a CIA front organization, and funded covertly through the Agency until 1971, when the Church Committee investigations forced public disclosure. Despite the controversy, Congress chose to maintain funding through an openly acknowledged Board for International Broadcasting.' },
        { heading: 'Jamming and Counter-Jamming', body: 'Soviet and Eastern Bloc authorities deployed extensive jamming operations against RFE/RL, spending more on jamming infrastructure than the United States spent on the original broadcasts. Jammers were countered by increases in transmitter power and frequency diversity. The arms race between broadcaster and jammer became a minor front of the Cold War itself.' },
        { heading: 'Solidarity and Samizdat', body: 'In Poland, RFE\'s Polish service was the principal source of information about the Solidarity trade union movement in the early 1980s, when domestic media was under martial law censorship. Lech Wałęsa later credited RFE broadcasts with sustaining the movement\'s information network. Similar roles were documented in Czechoslovakia and Hungary.' },
        { heading: 'Post–Cold War Legacy', body: 'Following the collapse of the Soviet Union, RFE/RL pivoted to broadcasting into new conflict zones and authoritarian states, including Russia, Belarus, Azerbaijan, Afghanistan, and Iran. The organization continues operating from Prague, where it moved after the Cold War, with a budget of approximately $130 million from the US Agency for Global Media.' },
      ],
      links: [
        { label: '▶ Radio Free Europe Archive (Archive.org)', url: 'https://archive.org/search?query=radio+free+europe' },
        { label: '▶ RFE/RL Cold War broadcasts on YouTube', url: 'https://www.youtube.com/results?search_query=radio+free+europe+cold+war' },
        { label: '📄 Wikipedia: Radio Free Europe/Radio Liberty', url: 'https://en.wikipedia.org/wiki/Radio_Free_Europe/Radio_Liberty' },
      ],
    },
    {
      id: 'cheers',
      title: 'Cheers',
      subtitle: 'Community, Escapism, and the American Bar as Social Institution',
      era: '1982–1993', medium: 'Television', network: 'NBC',
      tags: ['sitcom', '80s TV', '90s TV', 'NBC', 'Boston', 'community'],
      abstract: 'Cheers (1982–1993) was the dominant American sitcom of the 1980s and one of the most thoroughly studied works in television sociology. Set in a fictional Boston bar, the show used its single-room premise to examine the dynamics of community formation, the management of public and private selves, class differences, and the basic human need for belonging — all under the cover of character comedy.',
      sections: [
        { heading: 'The Bar as Third Place', body: 'Urban sociologist Ray Oldenburg\'s concept of the "third place" — a social environment distinct from home (first place) and work (second place) — describes exactly what the Cheers bar represents. The show\'s theme song, "Where Everybody Knows Your Name," articulates this directly, and the academic concept gained popular currency partly through the show\'s success.' },
        { heading: 'The Ensemble and Character Architecture', body: 'Creators Glen and Les Charles and James Burrows constructed one of television\'s most carefully balanced ensemble casts. The show could sustain storylines through Sam Malone (Ted Danson), Diane Chambers (Shelley Long), Carla Tortelli (Rhea Perlman), Cliff Clavin (John Ratzenberger), Norm Peterson (George Wendt), and Dr. Frasier Crane (Kelsey Grammer) — each character occupying a distinct class position and psychological archetype.' },
        { heading: 'The Diane/Rebecca Transition', body: 'The departure of Shelley Long after Season 5 and her replacement by Kirstie Alley as Rebecca Howe is one of the most-studied cast transitions in television history, frequently cited in discussions of ensemble drama resilience. The transition succeeded because the show\'s comedic engine was collective rather than dependent on a single character.' },
        { heading: 'The Cultural Footprint', body: 'Cheers was the most-watched program on American television for much of the 1980s and won the Emmy for Outstanding Comedy Series eleven times. The Frasier spin-off (1993–2004) ran for eleven seasons of its own, proving the depth of the character universe Cheers created.' },
      ],
      links: [
        { label: '▶ Cheers clips on YouTube', url: 'https://www.youtube.com/results?search_query=cheers+TV+show+classic+scenes' },
        { label: '📄 Wikipedia: Cheers', url: 'https://en.wikipedia.org/wiki/Cheers' },
        { label: '▶ Archive.org: Cheers', url: 'https://archive.org/search?query=cheers+TV+sitcom' },
      ],
    },
  ];

  /* ------------------------------------------------------------------
     ARTICLE BUILDER
  ------------------------------------------------------------------ */
  function buildArticleHTML(topic) {
    const linksHTML = topic.links.map(l =>
      `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer" class="research-link">${l.label}</a></li>`
    ).join('');

    const sectionsHTML = topic.sections.map(s => `
      <div class="research-section">
        <h3 class="research-section-heading">${s.heading}</h3>
        <p class="research-section-body">${s.body}</p>
      </div>
    `).join('');

    const tagsHTML = topic.tags.map(t =>
      `<span class="research-tag">${t}</span>`
    ).join('');

    return `
      <div class="research-article">
        <div class="research-header">
          <div class="research-meta-row">
            <span class="research-medium">${topic.medium}</span>
            <span class="research-era">${topic.era}</span>
            <span class="research-network">${topic.network}</span>
          </div>
          <h1 class="research-title">${topic.title}</h1>
          <h2 class="research-subtitle">${topic.subtitle}</h2>
          <div class="research-tags">${tagsHTML}</div>
        </div>
        <div class="research-abstract">
          <h3 class="research-section-heading">Abstract</h3>
          <p class="research-section-body">${topic.abstract}</p>
        </div>
        ${sectionsHTML}
        <div class="research-links-section">
          <h3 class="research-section-heading">📡 Watch / Listen / Read</h3>
          <ul class="research-links-list">${linksHTML}</ul>
        </div>
        <div class="research-footer">
          <span>∞ Alien Radio Research Engine · Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    `;
  }

  /** Pick a random topic, or the next sequential one */
  let _topicIdx = Math.floor(Math.random() * TOPICS.length);
  function nextTopic() {
    _topicIdx = (_topicIdx + 1) % TOPICS.length;
    return TOPICS[_topicIdx];
  }
  function randomTopic() {
    return TOPICS[Math.floor(Math.random() * TOPICS.length)];
  }
  function getTopicById(id) {
    return TOPICS.find(t => t.id === id) || null;
  }
  function getAllTopics() { return TOPICS; }

  /** Generate a full article (returns { topic, html, summary }) */
  function generateArticle(topicIdOrRandom) {
    const topic = typeof topicIdOrRandom === 'string'
      ? (getTopicById(topicIdOrRandom) || randomTopic())
      : randomTopic();
    const html = buildArticleHTML(topic);
    return {
      topic,
      html,
      summary: {
        id:       topic.id,
        title:    topic.title,
        subtitle: topic.subtitle,
        era:      topic.era,
        medium:   topic.medium,
        tags:     topic.tags,
      },
    };
  }

  return { generateArticle, nextTopic, randomTopic, getTopicById, getAllTopics, buildArticleHTML };
})();
