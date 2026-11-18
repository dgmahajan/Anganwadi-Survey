// DRAFT - not yet in surveys/index.js, so not live.
window.SURVEYS = window.SURVEYS || [];
window.SURVEYS.push({
  id:        "malati-vaidya-solar-2026",
  liveCamera:  true,   // in-page camera view (works where the phone ignores "open camera")
  cameraOnly:  true,   // photo buttons open the camera directly
  geoCheck:    true,   // GPS check at the door before the questions
  geo:         { radius: 50, goodAcc: 10, maxWait: 60 },
  phoneConfirm: true,  // show Sevika number (last 4 digits) to confirm
  mobileOnce:  true,   // mobile number asked only the first time
  marathiOnly: true,   // no English text anywhere in this survey
  name:      "मालती वैद्य स्मृती ट्रस्ट<br>ऑफ-ग्रिड सौर सर्वेक्षण",
  sheet_tab: "Malati Vaidya off grid battery less solar 2026",
  start:     "2026-11-18",   // testing from today; real start 20-11-2026
  end:       "2026-12-31",   // PLACEHOLDER

  intro: {
    title: "कृपया हे आधी वाचा",
    steps: [
      "या अॅपसाठी चांगले GPS लोकेशन आवश्यक आहे. कृपया तुमच्या अंगणवाडीच्या दारासमोर, <b>मोकळ्या आकाशाखाली बाहेर</b> उभे राहा आणि फोनमधील <b>लोकेशन चालू (ON)</b> करा.",
      "GPS ची अचूकता वाढेपर्यंत <b>१ मिनिटापर्यंत</b> थांबा. अचूकता सुमारे <b>५ मीटर</b> असावी.",
      "नंतर अंगणवाडीत जा, <b>\"पुढे\"</b> बटण दाबा आणि प्रश्नांची उत्तरे द्या."
    ]
  },

  schools: [
    { udise: "TEST",  name: "Test Anganwadi (Admin Preview)",  taluka: "Admin" },
    { udise: "TEST1", name: "Test Anganwadi1 (Admin Preview)", taluka: "Admin" },
    { udise: "99999999999", name: "Test Anganwadi at ZPS Test School Thane", taluka: "Thane", village: "Thane", lat: 19.209876, lng: 72.983438, phone4: "1234" },
    { udise: "27517160720", name: "Sakurliwadi", taluka: "Murbad", village: "Sakurli", lat: 19.189944, lng: 73.487641, phone4: "7139" },
    { udise: "27517160729", name: "Vidhe-1", taluka: "Murbad", village: "Vidhe", lat: 19.2323, lng: 73.491322, phone4: "0997" },
    { udise: "27517160730", name: "Vidhe-2", taluka: "Murbad", village: "Vidhe", lat: 19.232224, lng: 73.491311, phone4: "0352" },
    { udise: "27517160713", name: "Koravale-1", taluka: "Murbad", village: "Koravale", lat: 19.250664, lng: 73.477737, phone4: "5079" },
    { udise: "27517160130", name: "Savariwadi", taluka: "Murbad", village: "Milhe", lat: 19.213425, lng: 73.558273, phone4: "5609" },
    { udise: "27517160702", name: "Bangarpada", taluka: "Murbad", village: "Narivali", lat: 19.198288, lng: 73.498254, phone4: "4137" },
    { udise: "27517160705", name: "Dehari", taluka: "Murbad", village: "Dehari", lat: 19.204612, lng: 73.532219, phone4: "8535" },
    { udise: "27517160703", name: "Bhoirpada", taluka: "Murbad", village: "Narivali", lat: 19.193255, lng: 73.507248, phone4: "0616" },
    { udise: "27517160723", name: "Talekhal", taluka: "Murbad", village: "Talekhal", lat: 19.206036, lng: 73.528629, phone4: "1059" },
    { udise: "27517160129", name: "Milhe", taluka: "Murbad", village: "Milhe", lat: 19.212853, lng: 73.566042, phone4: "9097" },
    { udise: "27517160322", name: "Valhivare", taluka: "Murbad", village: "Mhadas", lat: 19.377622, lng: 73.743573, phone4: "6109" },
    { udise: "27517160320", name: "Umroli", taluka: "Murbad", village: "Kharshetumroli", lat: 19.395533, lng: 73.6505, phone4: "1700" },
    { udise: "27517160714", name: "Koravale-2", taluka: "Murbad", village: "Koravale", lat: 19.250436, lng: 73.478163, phone4: "6717" },
    { udise: "27517160721", name: "Shingolepada", taluka: "Murbad", village: "Khopivali", lat: 19.206092, lng: 73.549465, phone4: "7645" },
    { udise: "27517160711", name: "Khopivali", taluka: "Murbad", village: "Khopivali", lat: 19.203751, lng: 73.550066, phone4: "0087" },
    { udise: "27517160121", name: "Bendharwadi", taluka: "Murbad", village: "Koloshi", lat: 19.218981, lng: 73.583325, phone4: "7534" },
    { udise: "27517160728", name: "Umroli", taluka: "Murbad", village: "Umbroli Kh.", lat: 19.224947, lng: 73.581948, phone4: "3823" },
    { udise: "27517160718", name: "Sakurli", taluka: "Murbad", village: "Sakurli", lat: 19.189979, lng: 73.494353, phone4: "2884" },
    { udise: "27517160709", name: "Khanivare", taluka: "Murbad", village: "Khanivare", lat: 19.173507, lng: 73.495299, phone4: "8866" },
    { udise: "27517160125", name: "Vadachiwadi", taluka: "Murbad", village: "Koloshi", lat: 19.227002, lng: 73.55702, phone4: "7804" },
    { udise: "27517160306", name: "Fangloshi", taluka: "Murbad", village: "Fangaloshi", lat: 19.390178, lng: 73.659192, phone4: "6391" },
    { udise: "27517160712", name: "Khutarwadi", taluka: "Murbad", village: "Khutarwadigaon", lat: 19.223078, lng: 73.545262, phone4: "7645" },
    { udise: "27517160715", name: "Mhadas", taluka: "Murbad", village: "Mhadas", lat: 19.210833, lng: 73.467102, phone4: "0450" },
    { udise: "27517160123", name: "Ganeshpur", taluka: "Murbad", village: "Ganeshpur", lat: 19.217256, lng: 73.570141, phone4: "6561" },
    { udise: "27517160612", name: "Moroshi", taluka: "Murbad", village: "Moroshi", lat: 19.335438, lng: 73.696018, phone4: "8427" },
    { udise: "27517160502", name: "Godyachapada", taluka: "Murbad", village: "Talavali Baragaon", lat: 19.296956, lng: 73.636048, phone4: "0983" },
    { udise: "27517160301", name: "Alyachiwadi", taluka: "Murbad", village: "Merdi", lat: 19.398425, lng: 73.702817, phone4: "9434" },
    { udise: "27517160304", name: "Dharkhind", taluka: "Murbad", village: "Panshet", lat: 19.369411, lng: 73.708056, phone4: "3641" },
    { udise: "27517160315", name: "Modhalwadi", taluka: "Murbad", village: "Merdi", lat: 19.396241, lng: 73.708586, phone4: "0974" },
    { udise: "27517160313", name: "Lotyachiwadi", taluka: "Murbad", village: "Merdi", lat: 19.373351, lng: 73.69775, phone4: "0680" },
    { udise: "27517160105", name: "Indiranagar", taluka: "Murbad", village: "Dhasai", lat: 19.267837, lng: 73.598236, phone4: "5682" },
    { udise: "27517160128", name: "Koloshi Ka.Wadi", taluka: "Murbad", village: "Koloshi", lat: 19.233245, lng: 73.564189, phone4: "9362" },
    { udise: "27517160302", name: "Bandeshet", taluka: "Murbad", village: "Merdi", lat: 19.405174, lng: 73.699622, phone4: "1896" },
    { udise: "27517160314", name: "Merdi", taluka: "Murbad", village: "Merdi", lat: 19.383048, lng: 73.698825, phone4: "1358" },
    { udise: "27517160725", name: "Tuiai Ka.Wadi", taluka: "Murbad", village: "Tulai", lat: 19.210227, lng: 73.511167, phone4: "0292" },
  ],

  questions: [
    { id: "q0", text: "सर्व दिवे चालतात का?", type: "yesno" },
    { id: "q1", text: "एकूण किती दिवे बसवलेले आहेत?", type: "choice", options: [1, 2, 3, 4] },
    { id: "q10", text: "त्यापैकी किती दिवे चालत नाहीत?", type: "choice", options: [1, 2, 3, 4],
      showIf: { id: "q0", value: "no" } },
    { id: "q2", text: "दोन्ही छताचे पंखे चालतात का?", type: "yesno" },
    { id: "q11", text: "किती छताचे पंखे चालत नाहीत?", type: "choice", options: [1, 2],
      showIf: { id: "q2", value: "no" } },
    { id: "q3", text: "तुमच्या अंगणवाडीत टीव्ही आहे का?", type: "yesno" },
    { id: "q4", text: "टीव्ही विजेला जोडल्यावर चालतो का?", type: "yesno",
      showIf: { id: "q3", value: "yes" } },
    { id: "q5", text: "मुलांसाठी गाणी व व्हिडिओ असलेला पेन ड्राईव्ह (टीव्हीला जोडण्यासाठी) तुमच्याकडे आहे का?", type: "yesno",
      showIf: { id: "q3", value: "yes" } },
    { id: "q6", text: "पेन ड्राईव्हमधील गाणी / व्हिडिओ टीव्हीवर व्यवस्थित चालतात का?", type: "yesno",
      showIf: { id: "q5", value: "yes" } },
    { id: "q7", text: "इन्व्हर्टरचा फोटो काढा. इन्व्हर्टरला डिस्प्ले असल्यास, डिस्प्लेवरील आकडे स्पष्ट वाचता येतील असा फोटो काढा.", type: "photo", optional: false },
    { id: "q8", text: "अंगणवाडीवर जिथे कुठे अंगणवाडीचे नाव लिहिलेले आहे, त्याचा स्पष्ट फोटो काढा. नाव वाचता आले पाहिजे.",
      type: "photo", optional: false, once: true },
    { id: "q9", text: "या संदर्भात तुमची काही तक्रार किंवा सूचना असल्यास थोडक्यात लिहा.", type: "text", optional: true },
  ],
});
