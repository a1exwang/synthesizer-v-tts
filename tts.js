  
function getClientInfo() {
  return {
    "name" : "TTS",
    "category" : "a1exwang",
    "author" : "a1exwang",
    "versionNumber" : 1,
    "minEditorVersion" : 65540
  };
}

const ToneTotalSemitones = 9;

const SpeechTones = {
    1: [[1,5], [5,5]], // 3-3
    2: [[1,3], [1.5,3], [5,5]], // 3-5
    3: [[1,2], [2,1], [3, 0.5], [4,1], [5,3]], // 2-1-4, seems 2-1-0.5-1-4 is mor natural
    4: [[1,5], [1.5,5], [5,1]], // 5-1
}

function main() {
  const date = new Date();
  const groupName = "hello-" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDay() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();

  var mainProject = SV.getProject();
  var newGroup = SV.create("NoteGroup");
  var newGroupReference = SV.create("NoteGroupReference");
  newGroup.setName(groupName);
  mainProject.addNoteGroup(newGroup, 0);
  newGroupReference.setTarget(newGroup);
  // There always exists at least one track
  mainProject.getTrack(0).addGroupReference(newGroupReference);

  const defaultSentence = "da4 jia1 hao3/1.5 0 wo3 shi4 shi1/0.8 an4/1.2 0 shan1 shan1/1.2 0 wo3 jin1 tian1 lai2 jiao1 da4 jia1 shuo1 hua4/1.5";
  const sentence = SV.showInputBox("Please input sentences", "HERE:", defaultSentence);
  const words = parsePinyin(sentence);
  var offset = SV.QUARTER;
  for (var i = 0; i < words.length; i++) {
    const w = words[i];

    var stride = SV.QUARTER/2;

    var start = offset;
    var length = stride * w.length;
    if (w.pinyin) {
      createCharacter(newGroup, w.pinyin, 60, start, length, w.tone);
    }
    offset += length;
  }
}

function parsePinyin(sentence) {
  var words = sentence.split(/\s+/);
  var result = []
  for (var i = 0; i < words.length; i++) {
    result.push(parseSinglePinyin(words[i]));
  }
  return result;
}

function parseSinglePinyin(word) {
  const sp = word.split("/");
  const sp0 = sp[0];
  const pinyin = sp0.slice(0, sp0.length-1);
  const tone = parseInt(sp0[sp0.length-1]);
  var length = 1;
  if (sp.length > 1) {
    length = parseFloat(sp[1]);
  }

  return {pinyin: pinyin, tone: tone, length: length};
}

function createCharacter(group, lyrics, pitch, start, length, tone) {
  var n = SV.create("Note");
  n.setTimeRange(start, length);
  n.setPitch(pitch);
  n.setLyrics(lyrics);

  var pitchBend = group.getParameter("PitchDelta");
  createSpeechTone(pitchBend, start, length, tone);
  group.addNote(n);
}


function createSpeechTone(pitchBend, start, length, n) {
  for (var i = 0; i < SpeechTones[n].length; i++) {
    const t = SpeechTones[n][i][0];
    const pitch = SpeechTones[n][i][1];
    pitchBend.add(start + length / 4 * (t-1) * 0.9, ((pitch-1)/5*ToneTotalSemitones - (ToneTotalSemitones-1)/2) * 100);
  }
}