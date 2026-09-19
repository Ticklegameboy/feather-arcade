'use strict';
const I18n=(()=>{
 const messages={
 "我認輸！！我認輸！！": {"en":"I give up!! I give up!!","ja":"参った！！俺の負けだ！！"},
 "放開我！堂堂正正地較量！": {
  "en": "Release me! Fight me fairly!",
  "ja": "放せ！正々堂々と勝負しろ！"
 },
 "這是什麼招式……身體動不了！": {
  "en": "What technique is this? I cannot move!",
  "ja": "何の技だ……体が動かない！"
 },
 "別小看武者的意志！": {
  "en": "Do not underestimate my resolve!",
  "ja": "武道家の意志を甘く見るな！"
 },
 "可惡……必須穩住呼吸。": {
  "en": "Steady… I must control my breathing.",
  "ja": "くっ……呼吸を整えなければ。"
 },
 "你究竟想做什麼？": {
  "en": "What are you trying to do?",
  "ja": "一体、何が目的だ？"
 },
 "哈哈哈，停下！": {
  "en": "Ha ha ha, stop!",
  "ja": "はははっ、やめろ！"
 },
 "哈哈……別得意！": {
  "en": "Ha ha… do not get cocky!",
  "ja": "ははっ……調子に乗るな！"
 },
 "哈哈哈！這算什麼較量！": {
  "en": "Ha ha ha! What kind of duel is this?!",
  "ja": "ははは！こんなのが勝負か！"
 },
 "哈、哈哈！我還沒認輸！": {
  "en": "Ha, ha ha! I have not yielded!",
  "ja": "は、ははっ！まだ負けていない！"
 },
 "哈哈哈哈": {
  "en": "Ha ha ha ha!",
  "ja": "ははははっ！"
 },
 "哈哈哈哈哈哈！！": {
  "en": "Hahahahaha!!",
  "ja": "はははははは！！"
 },
 "哈哈哈哈！有本事正面交手！": {
  "en": "Hahaha! Face me in a fair fight!",
  "ja": "はははは！正面から勝負しろ！"
 },
 "哈哈哈哈！可惡的傢伙！": {
  "en": "Hahaha! You wretched trickster!",
  "ja": "はははっ！この卑怯者め！"
 },
 "哈哈哈哈……呼吸亂了！": {
  "en": "Hahaha… my breathing is slipping!",
  "ja": "はははは……呼吸が乱れる！"
 },
 "哈哈哈哈！別以為我會屈服！": {
  "en": "Hahaha! I will not give in!",
  "ja": "はははっ！屈すると思うな！"
 },
 "哈哈哈哈哈哈！！先、先停一下！": {
  "en": "Hahahahaha!! W-wait a moment!",
  "ja": "はははははは！！ま、待ってくれ！"
 },
 "哈哈哈哈……讓我喘口氣！": {
  "en": "Hahaha… let me catch my breath!",
  "ja": "はははは……息をつかせてくれ！"
 },
 "哈哈哈哈！夠了……拜託！": {
  "en": "Hahaha! Enough… please!",
  "ja": "はははは！もう……頼む！"
 },
 "哈哈哈哈……休息一下，再較量！": {
  "en": "Hahaha… a short rest, then we duel!",
  "ja": "はははは……少し休んで、再勝負だ！"
 },
 "點擊滑鼠，發射禁錮魔法。": {
  "en": "Click to fire binding magic.",
  "ja": "クリックで拘束魔法を発射。"
 },
 "移動羽毛滑鼠，對禁錮的敵人進行搔癢攻擊。": {
  "en": "Move the feather cursor to tickle bound enemies.",
  "ja": "羽根カーソルを動かして、拘束した敵をくすぐろう。"
 },
 "點擊發光的笑聲按鈕，解鎖新的禁錮魔法！": {
  "en": "Click the glowing Laughter button to unlock new binding magic!",
  "ja": "光る笑い声ボタンを押して、新しい拘束魔法を解放しよう！"
 },
 "你已抓到隆！點擊發光的地牢按鈕，查看已收錄的敵人。": {
  "en": "Ryu captured! Click the glowing Dungeon button to see your captured enemies.",
  "ja": "リュウを捕獲！光る地下牢ボタンを押して、捕まえた敵を見よう。"
 },
 "恭喜解鎖新的魔法，快去試試吧！": {
  "en": "New magic unlocked! Go give it a try!",
  "ja": "新しい魔法を解放しました！さっそく試してみよう！"
 },
 "去試試": {
  "en": "Try it out",
  "ja": "試してみる"
 },
 "新魔法禁錮動畫": {
  "en": "New binding magic animation",
  "ja": "新しい拘束魔法のアニメーション"
 },
 "重新開始": {
  "en": "New game",
  "ja": "最初から"
 },
 "重新開始會清除笑聲、已學魔法與地牢收藏。": {
  "en": "New game resets laughter, learned magic and dungeon collection.",
  "ja": "最初から始めると、笑い声・習得魔法・地下牢の収録をリセットします。"
 },
 "魔法商店": {
  "en": "Magic shop",
  "ja": "魔法ショップ"
 },
 "關閉": {
  "en": "Close",
  "ja": "閉じる"
 },
 "笑聲 · 開啟魔法商店": {
  "en": "Laughter · Open magic shop",
  "ja": "笑い声 · 魔法ショップを開く"
 },
 "新魔法可習得": {
  "en": "New magic available",
  "ja": "新しい魔法を習得できます"
 },
 "持有笑聲：{amount}": {
  "en": "Laughter: {amount}",
  "ja": "所持笑い声：{amount}"
 },
 "已擁有": {
  "en": "Owned",
  "ja": "習得済み"
 },
 "花費 35 笑聲，學習你的第一個新魔法！": {
  "en": "Spend 35 laughter to learn your first new magic!",
  "ja": "笑い声を35消費して、初めての新しい魔法を習得しよう！"
 },
 "黑色繃帶纏繞 · 戰鬥與地牢可用": {
  "en": "Black bandages · Battle & dungeon",
  "ja": "黒い包帯 · 戦闘・地下牢で使用可能"
 },
 "彎曲黑藤纏繞 · 地牢專屬": {
  "en": "Twisting dark vines · Dungeon only",
  "ja": "うねる黒い蔓 · 地下牢専用"
 },
 "學習 {magic}，花費 {price} 笑聲": {
  "en": "Learn {magic} for {price} laughter",
  "ja": "笑い声{price}で{magic}を習得"
 },
 "木乃伊禁錮": {
  "en": "Mummy binding",
  "ja": "ミイラ拘束"
 },
 "藤蔓禁錮": {
  "en": "Vine binding",
  "ja": "蔓の拘束"
 },
 "笑聲": {
  "en": "Laughter",
  "ja": "笑い声"
 },
 "破防": {
  "en": "Guard break",
  "ja": "ガード崩し"
 },
 "禁錮魔法": {
  "en": "Binding magic",
  "ja": "拘束魔法"
 },
 "預設": {
  "en": "Default",
  "ja": "標準"
 },
 "木乃伊": {
  "en": "Mummy",
  "ja": "ミイラ"
 },
 "藤蔓": {
  "en": "Vines",
  "ja": "蔓"
 },
 "地下牢 · 永久禁錮": {
  "en": "DUNGEON · PERMANENT BINDING",
  "ja": "地下牢 · 永続拘束"
 },
 "地牢": {
  "en": "Dungeon",
  "ja": "地下牢"
 },
 "返回戰鬥": {
  "en": "Back to battle",
  "ja": "戦闘に戻る"
 },
 "返回地牢": {
  "en": "Back to dungeon",
  "ja": "地下牢に戻る"
 },
 "地牢囚徒": {
  "en": "Dungeon prisoners",
  "ja": "地下牢の囚人"
 },
 "已收錄 {count} 位敵人": {
  "en": "{count} enemies collected",
  "ja": "収録した敵：{count} 人"
 },
 "左右拖曳查看其他監獄": {
  "en": "Drag sideways to explore more cells",
  "ja": "左右にドラッグしてほかの牢を見る"
 },
 "擊敗敵人後，將在這裡收錄": {
  "en": "Defeated enemies join your collection here",
  "ja": "倒した敵がここに収録されます"
 },
 "上一組監獄": {
  "en": "Previous cells",
  "ja": "前の牢"
 },
 "下一組監獄": {
  "en": "Next cells",
  "ja": "次の牢"
 },
 "監獄 {number}": {
  "en": "Cell {number}",
  "ja": "牢 {number}"
 },
 "進入監獄 {number}": {
  "en": "Enter cell {number}",
  "ja": "牢 {number} に入る"
 },
 "空監獄": {
  "en": "Empty cell",
  "ja": "空の牢"
 },
 "點選進入": {
  "en": "Enter cell",
  "ja": "クリックして入る"
 },
 "尚未收錄": {
  "en": "Unoccupied",
  "ja": "未収録"
 },
 "已收錄地牢": {
  "en": "Added to dungeon",
  "ja": "地下牢に収録"
 },
 "大笑中": {
  "en": "Laughing",
  "ja": "大笑い中"
 },
 "永久禁錮": {
  "en": "Permanent binding",
  "ja": "永続拘束"
 },
 "羽毛接觸互動 · 永久禁錮": {
  "en": "Feather interaction · Permanent binding",
  "ja": "羽で触れて反応を見る · 永続拘束"
 },
 "羽夜奇譚": {
  "en": "Feather After Dark",
  "ja": "羽夜奇譚"
 },
 "羽夜奇譚 · 魔法街機": {
  "en": "Feather After Dark · Magic Arcade",
  "ja": "羽夜奇譚 · 魔法アーケード"
 },
 "黑袍巫師的畫素橫版冒險。用三種非傷害魔法，挑戰成年格鬥家。": {
  "en": "A pixel side-scrolling adventure. Challenge adult fighters with three harmless spells.",
  "ja": "黒衣の魔法使いの横スクロール冒険。傷つけない3つの魔法で成人の格闘家に挑もう。"
 },
 "街機實驗室": {
  "en": "ARCADE LAB",
  "ja": "アーケードラボ"
 },
 "♫ 音效：關": {
  "en": "♫ Sound: Off",
  "ja": "♫ 効果音：オフ"
 },
 "♫ 音效：開": {
  "en": "♫ Sound: On",
  "ja": "♫ 効果音：オン"
 },
 "開啟音效": {
  "en": "Enable sound",
  "ja": "効果音をオン"
 },
 "關閉音效": {
  "en": "Disable sound",
  "ja": "効果音をオフ"
 },
 "橫版魔法格鬥遊戲": {
  "en": "Side-scrolling magic fighting game",
  "ja": "横スクロール魔法格闘ゲーム"
 },
 "單人冒險": {
  "en": "SOLO ADVENTURE",
  "ja": "ひとりで冒険"
 },
 "CHAPTER 01 · 都市夜巷": {
  "en": "CHAPTER 01 · City Back Alley",
  "ja": "CHAPTER 01 · 夜の路地裏"
 },
 "Ⅱ 暫停": {
  "en": "Ⅱ Pause",
  "ja": "Ⅱ 一時停止"
 },
 "▶ 繼續": {
  "en": "▶ Resume",
  "ja": "▶ 再開"
 },
 "遊戲畫面，使用 A D 移動，J K L 施法，點選畫面近戰，E 切換附近禁錮目標外觀": {
  "en": "Game: A/D to move, J/K/L to cast, click for melee, E to change a nearby bound target’s outfit",
  "ja": "ゲーム画面：A/Dで移動、J/K/Lで魔法、クリックで近接攻撃、Eで近くの拘束した相手の衣装を変更"
 },
 "切換附近禁錮目標的上衣外觀": {
  "en": "Change a nearby bound target’s outfit",
  "ja": "近くの拘束した相手の上着を切り替える"
 },
 "切換無上衣 · E": {
  "en": "Remove shirt · E",
  "ja": "上着を脱がせる · E"
 },
 "恢復上衣 · E": {
  "en": "Restore shirt · E",
  "ja": "上着を戻す · E"
 },
 "今夜，讓對手": {
  "en": "Tonight, make them",
  "ja": "今夜は相手を"
 },
 "笑著認輸。": {
  "en": "laugh and surrender.",
  "ja": "笑わせて降参。"
 },
 "披上黑袍，走進都市夜巷。": {
  "en": "Don your black robe. Enter the city back alley.",
  "ja": "黒いローブをまとい、夜の路地裏へ。"
 },
 "用不傷人的魔法，開啟你的街機冒險。": {
  "en": "Begin your arcade adventure with harmless magic.",
  "ja": "傷つけない魔法で、冒険を始めよう。"
 },
 "開始冒險": {
  "en": "Start adventure",
  "ja": "冒険を始める"
 },
 "正在喚醒魔法…": {
  "en": "Waking the magic…",
  "ja": "魔法を準備中…"
 },
 "魔法暫停中": {
  "en": "Magic on pause",
  "ja": "魔法はひと休み"
 },
 "喘口氣，再向前。": {
  "en": "Take a breath, then carry on.",
  "ja": "ひと息ついたら、また進もう。"
 },
 "繼續冒險": {
  "en": "Resume adventure",
  "ja": "冒険を続ける"
 },
 "✧ 無傷害魔法對決": {
  "en": "✧ Harmless magic duels",
  "ja": "✧ 傷つけない魔法対決"
 },
 "點選禁錮 · 羽毛接觸禁錮目標 · E 換裝 · 空格閃避": {
  "en": "Click to bind · Feather touches bound foes · E outfit · Space dodge",
  "ja": "連続クリックで近接攻撃 · 拘束した相手に近づいて衣装変更 · Spaceで回避"
 },
 "前進 →": {
  "en": "Onward →",
  "ja": "進もう →"
 },
 "遊戲操作": {
  "en": "Game controls",
  "ja": "操作方法"
 },
 "移動 / 近戰": {
  "en": "MOVE / MELEE",
  "ja": "移動 / 近接攻撃"
 },
 "滑鼠": {
  "en": "Mouse",
  "ja": "マウス"
 },
 "點選禁錮 · 羽毛接觸攻擊": {
  "en": "Click to bind · Feather contact",
  "ja": "連続クリック · 近接くすぐり"
 },
 "左右移動": {
  "en": "Move left / right",
  "ja": "左右に移動"
 },
 "短距閃避": {
  "en": "Short dodge",
  "ja": "短距離回避"
 },
 "J · 遠端消耗": {
  "en": "J · RANGED",
  "ja": "J · 遠距離"
 },
 "輕羽咒": {
  "en": "Feather Spell",
  "ja": "羽毛の魔法"
 },
 "飛羽使對手發笑，打斷攻擊": {
  "en": "Flying feathers cause laughter and interrupt attacks",
  "ja": "羽毛で相手を笑わせ、攻撃を中断"
 },
 "就緒": {
  "en": "Ready",
  "ja": "準備完了"
 },
 "K · 禁錮 20 秒": {
  "en": "K · BIND FOR 20s",
  "ja": "K · 20秒拘束"
 },
 "紫環禁錮": {
  "en": "Violet Binding",
  "ja": "紫環の拘束"
 },
 "魔法環鎖定四肢，懸浮 20 秒": {
  "en": "Magic rings bind and suspend foes for 20 seconds",
  "ja": "魔法の輪で手足を拘束し、20秒間浮遊"
 },
 "L · 近距持續": {
  "en": "L · CLOSE RANGE",
  "ja": "L · 近距離持続"
 },
 "浮空靈手": {
  "en": "Spectral Hands",
  "ja": "浮遊する霊の手"
 },
 "魔法靈手持續消耗對手體力": {
  "en": "Spectral hands steadily drain stamina",
  "ja": "魔法の手が相手の体力を削り続ける"
 },
 "近戰撓癢": {
  "en": "Melee tickle",
  "ja": "近接くすぐり"
 },
 "閃避": {
  "en": "Dodge",
  "ja": "回避"
 },
 "對手：隆 · 成年格鬥家 · SF III 動作": {
  "en": "Opponent: Ryu · Adult fighter · SF III moves",
  "ja": "対戦相手：リュウ · 成人の格闘家 · SF IIIモーション"
 },
 "擊敗首位隆後，後續敵人才會出現": {
  "en": "Defeat the first Ryu to unlock more opponents",
  "ja": "最初のリュウを倒すと、次の敵が出現"
 },
 "重新開始 ↻": {
  "en": "Restart ↻",
  "ja": "やり直す ↻"
 },
 "動作素材與製作說明": {
  "en": "Animation credits & production notes",
  "ja": "アニメーション素材・制作について"
 },
 "完整來源說明": {
  "en": "Full source credits",
  "ja": "出典の詳細"
 },
 "隆的常規戰鬥使用 Umihei 的 SF3 Ryu 精靈與 AIR 動作資料，取自": {
  "en": "Ryu’s regular combat uses Umihei’s SF3 Ryu sprites and AIR animation data from",
  "ja": "リュウの通常戦闘には、Umihei氏のSF3 RyuスプライトとAIRモーションデータを使用。配布元："
 },
 "。原角色與遊戲美術：CAPCOM。已匯入 1,285 個精靈項與 712 組動作定義（含特效、變體）；當前戰鬥使用其中的移動、防禦、拳腳和必殺技動作。禁錮懸浮和禁錮受擊大笑各使用四幀畫素動畫，參照新版隆造型創作；普通受擊在新版受擊動作中加入忍笑表情，體力耗盡後播放新版倒地動作並保持昏迷姿勢。當前使用的角色動作均有無上衣差分，另有巫師近戰手勢動畫。": {
  "en": " . Original character and game art: CAPCOM. Includes 1,285 sprite entries and 712 animation definitions, including effects and variants. Combat uses movement, guard, punches, kicks and special moves. Binding and bound laughter each use four custom pixel frames based on the updated Ryu design. Normal hit reactions include a restrained smile; depleted stamina triggers a fall and unconscious pose. All active character animations include shirtless variants, alongside the wizard’s melee gestures.",
  "ja": "。原作キャラクター・ゲーム美術：CAPCOM。エフェクトや差分を含む1,285個のスプライト項目と712組のモーション定義を収録。戦闘では移動、防御、パンチ、キック、必殺技を使用。拘束浮遊と拘束中の大笑いには、新しいリュウの姿を参考にした各4フレームのピクセルアニメーションを使用。通常被弾時は笑いをこらえる表情になり、体力が尽きると倒れて気絶した姿勢を保つ。使用中の全キャラクターモーションに上半身裸の差分があり、魔法使いの近接攻撃用の手振りも収録。"
 },
 "輕拳": {
  "en": "Jab",
  "ja": "弱パンチ"
 },
 "直拳": {
  "en": "Straight punch",
  "ja": "ストレート"
 },
 "重拳": {
  "en": "Heavy punch",
  "ja": "強パンチ"
 },
 "勾拳": {
  "en": "Hook",
  "ja": "フック"
 },
 "輕踢": {
  "en": "Light kick",
  "ja": "弱キック"
 },
 "側踢": {
  "en": "Side kick",
  "ja": "サイドキック"
 },
 "迴旋踢": {
  "en": "Roundhouse",
  "ja": "回し蹴り"
 },
 "高踢": {
  "en": "High kick",
  "ja": "ハイキック"
 },
 "蹲拳": {
  "en": "Crouching punch",
  "ja": "しゃがみパンチ"
 },
 "低踢": {
  "en": "Low kick",
  "ja": "ローキック"
 },
 "掃腿": {
  "en": "Sweep",
  "ja": "足払い"
 },
 "跳躍踢": {
  "en": "Jump kick",
  "ja": "ジャンプキック"
 },
 "波動拳": {
  "en": "Hadouken",
  "ja": "波動拳"
 },
 "升龍拳": {
  "en": "Shoryuken",
  "ja": "昇龍拳"
 },
 "旋風腿": {
  "en": "Hurricane kick",
  "ja": "竜巻旋風脚"
 },
 "影象載入失敗": {
  "en": "Image loading failed",
  "ja": "画像の読み込みに失敗"
 },
 "隆的戰鬥動作已就緒 · 按 Enter 開始": {
  "en": "Ryu is ready · Press Enter to start",
  "ja": "準備完了 · Enterで開始"
 },
 "素材載入失敗，請重新整理重試": {
  "en": "Assets failed to load. Refresh to retry.",
  "ja": "素材の読み込みに失敗しました。再読み込みしてください。"
 },
 "體力耗盡 · 倒地昏迷": {
  "en": "Stamina depleted · Knocked out",
  "ja": "体力切れ · 気絶"
 },
 "格擋": {
  "en": "Blocked",
  "ja": "ガード"
 },
 "哈哈哈哈！": {
  "en": "Hahahaha!",
  "ja": "ははははっ！"
 },
 "禁錮 · 20 秒": {
  "en": "Bound · 20 seconds",
  "ja": "拘束 · 20秒"
 },
 "哈哈哈！": {
  "en": "Ha ha ha!",
  "ja": "はははっ！"
 },
 "哈！": {
  "en": "Ha!",
  "ja": "ははっ！"
 },
 "靠近並面向對手": {
  "en": "Get closer and face your opponent",
  "ja": "相手に近づいて向き合おう"
 },
 "魔力需要<br><em>休息一下。</em>": {
  "en": "Your magic needs<br><em>a little rest.</em>",
  "ja": "魔力にも<br><em>ひと休みを。</em>"
 },
 "本次探索 {meters} 米 · 擊敗 {kills} 位對手": {
  "en": "Explored {meters} m · Defeated {kills} opponents",
  "ja": "探索距離 {meters} m · {kills}人撃破"
 },
 "再來一次 <span>↵</span>": {
  "en": "Try again <span>↵</span>",
  "ja": "もう一度 <span>↵</span>"
 },
 "用禁錮打斷起手；看到波動拳時，閃避穿過。": {
  "en": "Interrupt with Binding; dodge through Hadouken.",
  "ja": "拘束で出始めを止め、波動拳は回避ですり抜けよう。"
 },
 "大笑 · ": {
  "en": "Laughing · ",
  "ja": "大笑い · "
 },
 "禁錮 ": {
  "en": "Bound ",
  "ja": "拘束 "
 },
 "忍笑…": {
  "en": "Holding back laughter…",
  "ja": "笑いをこらえる…"
 },
 "防禦": {
  "en": "Guard",
  "ja": "防御"
 },
 "起身調整": {
  "en": "Recovering",
  "ja": "体勢を立て直す"
 },
 "隆": {
  "en": "Ryu",
  "ja": "リュウ"
 },
 "黑袍巫師": {
  "en": "Dark Wizard",
  "ja": "黒衣の魔法使い"
 },
 "體力": {
  "en": "HP",
  "ja": "体力"
 },
 "已擊敗": {
  "en": "Defeated",
  "ja": "撃破"
 },
 "都市夜巷": {
  "en": "City Back Alley",
  "ja": "夜の路地裏"
 },
 " 連擊": {
  "en": " HIT COMBO",
  "ja": " コンボ"
 },
 "語言": {
  "en": "Language",
  "ja": "言語"
 },
 "切換木乃伊禁錮": {
  "en": "Mummy binding",
  "ja": "ミイラ拘束に切替"
 },
 "恢復普通禁錮": {
  "en": "Normal binding",
  "ja": "通常拘束に戻す"
 },
 "切換藤蔓禁錮": {
  "en": "Vine binding",
  "ja": "蔓拘束に切替"
 },
 "切換藤蔓禁錮分支": {
  "en": "Switch vine binding form",
  "ja": "蔓の拘束形態を切り替える"
 },
 "切換禁錮魔法分支": {
  "en": "Switch binding spell form",
  "ja": "拘束魔法の形態を切り替える"
 },
 "切換禁錮目標的上衣外觀": {
  "en": "Change the bound target’s outfit",
  "ja": "拘束中の相手の上着を切り替える"
 },
 "遊戲畫面，A D 移動，J K L 施法，點選朝滑鼠方向發射禁錮光圈，E 切換禁錮目標外觀": {
  "en": "Game: A/D to move, J/K/L to cast, click to face the pointer and launch a binding ring, E to change the bound target’s outfit",
  "ja": "A/Dで移動、J/K/Lで魔法、クリックした側を向いて拘束リングを発射、Eで拘束中の相手の衣装を変更"
 },
 "點選轉身發射光圈 · 命中禁錮 · E 換裝": {
  "en": "Click to turn & fire a ring · Bind on impact · E outfit",
  "ja": "クリックで振り向きリング発射 · 命中で拘束 · E 衣装"
 },
 "點選轉身 · 發射禁錮光圈": {
  "en": "Click to turn & fire a binding ring",
  "ja": "クリックで振り向き拘束リング発射"
 },
 "旋轉光圈命中首位敵人，禁錮 20 秒": {
  "en": "Spinning ring binds the first target hit for 20s",
  "ja": "回転リングが最初に命中した相手を20秒拘束"
 },
 "背景：Back Alley (Alt) · Dissidia · Melty Blood / AI alley extension · gpt-image-2 ·": {
  "en": "Background: Back Alley (Alt) · Dissidia · Melty Blood / AI alley extension · gpt-image-2 ·",
  "ja": "背景：Back Alley (Alt) · Dissidia · Melty Blood / AI alley extension · gpt-image-2 ·"
 },
 "哈、哈哈哈！": {
  "en": "Ha—hahaha!",
  "ja": "は、はははっ！"
 },
 "哈哈，哈哈！": {
  "en": "Haha, haha!",
  "ja": "ははっ、ははは！"
 },
 "哈啊哈哈！": {
  "en": "Haa-hahaha!",
  "ja": "はあははっ！"
 },
 "哈啊哈哈哈哈！": {
  "en": "Haa-hahahaha!",
  "ja": "はあはははは！"
 },
 "哈哈哈哈、哈哈哈！": {
  "en": "Hahaha—hahaha!",
  "ja": "はははは、はははっ！"
 },
 "啊哈哈哈哈哈！": {
  "en": "Ahahahahaha!",
  "ja": "あはははははっ！"
 },
 "哈哈、哈哈哈哈！！": {
  "en": "Haha—hahahaha!!",
  "ja": "ははっ、はははは！！"
 },
 "啊哈哈哈哈哈哈！！": {
  "en": "Ahahahahahaha!!",
  "ja": "あはははははは！！"
 },
 "哈、哈啊哈哈哈哈！！": {
  "en": "Ha—haa-hahahaha!!",
  "ja": "は、はあはははは！！"
 },
 "哈哈哈哈！哈哈哈哈！！": {
  "en": "Hahaha! Hahahaha!!",
  "ja": "はははは！はははは！！"
 },
 "哈哈哈哈哈哈哈——！": {
  "en": "Hahahahahahaaa!",
  "ja": "はははははははーっ！"
 },
 "啊哈、哈哈哈哈哈！！": {
  "en": "Aha—hahahahaha!!",
  "ja": "あはっ、ははははは！！"
 },
 "哈哈哈、哈啊哈哈！！": {
  "en": "Hahaha—haa-haha!!",
  "ja": "はははっ、はあはは！！"
 },
 "哈啊啊哈哈哈哈！！": {
  "en": "Haaah-hahahaha!!",
  "ja": "はああはははは！！"
 },
 "這是……魔法嗎？": {
  "en": "Is this… magic?",
  "ja": "これは……魔法か？"
 },
 "喂！把這些光圈弄開！": {
  "en": "Hey! Get these rings off me!",
  "ja": "おい！この輪を外せ！"
 },
 "手腳都被鎖住了……見鬼！": {
  "en": "Arms and legs locked… damn it!",
  "ja": "手も足も動かん……くそ！"
 },
 "哈哈哈！鬆開光圈，混蛋！": {
  "en": "Hahaha! Undo the rings, bastard!",
  "ja": "はははっ！輪を外せ、この野郎！"
 },
 "哈哈哈！有種先放我下來！": {
  "en": "Hahaha! Put me down if you dare!",
  "ja": "ははは！まず下ろせ、卑怯者！"
 },
 "哈、哈哈！別碰我的腳！": {
  "en": "Ha—haha! Leave my feet alone!",
  "ja": "は、ははっ！足に触るな！"
 },
 "哈哈哈哈！放我下來！求你了！": {
  "en": "Hahaha! Put me down! Please!",
  "ja": "はははは！下ろしてくれ！頼む！"
 },
 "先把光圈鬆開……我不打了！": {
  "en": "Loosen the rings… I will stop fighting!",
  "ja": "輪を緩めてくれ……もう戦わない！"
 },
 "難道你喜歡我的肌肉？": {
  "en": "Do you like my muscles or something?",
  "ja": "俺の筋肉が好きなのか？"
 },
 "看夠了沒？把衣服還我！": {
  "en": "Done staring? Give my shirt back!",
  "ja": "もう見ただろ？上着を返せ！"
 },
 "沒了上衣，我照樣能打！": {
  "en": "Shirt or no shirt, I can still fight!",
  "ja": "上着がなくても、俺は戦える！"
 },
 "哈哈哈！肌肉不是給你撓的！": {
  "en": "Hahaha! My muscles are not for tickling!",
  "ja": "ははは！筋肉はくすぐるためじゃない！"
 },
 "哈、哈哈！別撓肚子，混蛋！": {
  "en": "Ha—haha! Not my stomach, bastard!",
  "ja": "は、ははっ！腹はやめろ、この野郎！"
 },
 "哈哈哈！把上衣還我啊！": {
  "en": "Hahaha! Give my shirt back already!",
  "ja": "ははは！早く上着を返せ！"
 },
 "哈哈哈哈！別撓了！衣服給你行了吧！": {
  "en": "Hahaha! Stop! Fine, keep the shirt!",
  "ja": "はははは！やめてくれ！上着はやる！"
 },
 "肚子受不了了……停一下，拜託！": {
  "en": "My stomach cannot take it… please stop!",
  "ja": "腹がもう限界だ……頼む、やめてくれ！"
 },
 "可惡，完全動不了！": {
  "en": "Damn it, I cannot move at all!",
  "ja": "くそ、まったく動けない！"
 },
 "喂！把這破布拆了！": {
  "en": "Hey! Get these damn rags off!",
  "ja": "おい！このボロ布をほどけ！"
 },
 "綁成這樣，還怎麼打！": {
  "en": "How am I supposed to fight like this?!",
  "ja": "こんなに巻かれて、戦えるか！"
 },
 "哈哈哈！腳也躲不開，混蛋！": {
  "en": "Hahaha! I cannot even move my feet, bastard!",
  "ja": "ははは！足も逃がせん、この野郎！"
 },
 "哈、哈哈！別趁我被綁著！": {
  "en": "Ha—haha! Not while I am tied up!",
  "ja": "は、ははっ！縛られてる時にやるな！"
 },
 "哈哈哈！這破布怎麼扯不開！": {
  "en": "Hahaha! Why will these damn rags not tear?!",
  "ja": "ははは！何でこの布は破れないんだ！"
 },
 "哈哈哈哈！拆一點！讓我動一下！": {
  "en": "Hahaha! Unwrap a little! Let me move!",
  "ja": "はははは！少しほどいて！動かせてくれ！"
 },
 "他媽的……求你把腳放開！": {
  "en": "Damn it… please let my feet go!",
  "ja": "くそっ……頼む、足を自由にしてくれ！"
 },
 "這些是什麼鬼東西！！": {
  "en": "What the hell are these things?!",
  "ja": "何だ、このわけのわからん物は！！"
 },
 "可惡，這些東西的力氣真大！！": {
  "en": "Damn it, these things are strong!!",
  "ja": "くそ、こいつら何て力だ！！"
 },
 "別纏了！給我鬆開！": {
  "en": "Stop wrapping around me! Let go!",
  "ja": "絡みつくな！離せ！"
 },
 "哈哈哈！這鬼東西還會動！": {
  "en": "Hahaha! These damn things are moving!",
  "ja": "ははは！こいつら、まだ動くのか！"
 },
 "哈、哈哈！別把我的腳撐開！": {
  "en": "Ha—haha! Stop holding my feet apart!",
  "ja": "は、ははっ！足を広げるな！"
 },
 "哈哈哈！混蛋，叫它們鬆手！": {
  "en": "Hahaha! Bastard, make them let go!",
  "ja": "ははは！この野郎、こいつらを離せ！"
 },
 "哈哈哈哈！收回去！快收回去！": {
  "en": "Hahaha! Call them off! Now, please!",
  "ja": "はははは！引っ込めて！早く！"
 },
 "這些藤蔓……放鬆點，求你了！": {
  "en": "These vines… loosen them, please!",
  "ja": "この蔓……少し緩めてくれ、頼む！"
 },
 "停！停！我認輸了！": {
  "en": "Stop! Stop! I give up!",
  "ja": "やめて！やめて！参った！"
 },
 "夠了，混蛋……求你了！": {
  "en": "Enough, bastard… please!",
  "ja": "もうやめろ、この野郎……頼む！"
 },
 "喘不過氣了……歇一下！": {
  "en": "I cannot catch my breath… a break!",
  "ja": "息ができん……少し休ませて！"
 },
 "別碰那裡！拜託！": {
  "en": "Not there! Please!",
  "ja": "そこはやめて！頼む！"
 },
 "他媽的……我真受不了了！": {
  "en": "Damn it… I really cannot take any more!",
  "ja": "くそっ……本当にもう無理だ！"
 },
 "行了行了！算你贏！": {
  "en": "All right, all right! You win!",
  "ja": "わかった、わかった！お前の勝ちだ！"
 },
 "哈哈哈哈！認輸！我認輸！": {
  "en": "Hahaha! I give! I give up!",
  "ja": "はははは！参った！俺の負けだ！"
 },
 "哈哈哈哈！別撓腳了！求你！": {
  "en": "Hahaha! Not my feet! Please!",
  "ja": "はははは！足はもうやめて！頼む！"
 },
 "哈啊哈哈！混蛋，慢一點啊！": {
  "en": "Haa-haha! Bastard, slow down!",
  "ja": "はあはは！この野郎、少しゆっくり！"
 },
 "哈哈哈哈！我錯了，停手！": {
  "en": "Hahaha! My mistake, stop!",
  "ja": "はははは！悪かった、やめてくれ！"
 },
 "哈哈哈哈！不打了！真不打了！": {
  "en": "Hahaha! No more fighting! I mean it!",
  "ja": "はははは！もう戦わない！本当だ！"
 },
 "哈哈哈哈！饒了我這回吧！": {
  "en": "Hahaha! Let me off this once!",
  "ja": "はははは！今回だけは勘弁してくれ！"
 }
};

 const supported=['zh-TW','en','ja'],storageKey='feather-arcade.language';
 let language='zh-TW';try{const saved=localStorage.getItem(storageKey);if(saved==='zh-CN'){language='zh-TW';localStorage.setItem(storageKey,language);}else if(supported.includes(saved))language=saved;}catch{}
 function t(source,params={}){let value=(messages[source]||{})[language]??source;return value.replace(/\{(\w+)\}/g,(_,key)=>params[key]??'{'+key+'}');}
 const nodes=[],attrs=[];
 function capture(node){if(node.nodeType===3&&messages[node.textContent.trim()])nodes.push({node,source:node.textContent.trim(),leading:node.textContent.match(/^\s*/)[0],trailing:node.textContent.match(/\s*$/)[0]});else if(node.nodeType===1&&!['SCRIPT','STYLE'].includes(node.tagName)){for(const name of ['aria-label','content']){const source=node.getAttribute(name);if(source&&messages[source])attrs.push({node,name,source});}for(const child of node.childNodes)capture(child);}}
 if(document.documentElement)capture(document.documentElement);
 function apply(){if(document.documentElement)document.documentElement.lang=language;for(const {node,source,leading,trailing} of nodes)node.textContent=leading+t(source)+trailing;for(const {node,name,source} of attrs)node.setAttribute(name,t(source));document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));}
 function setLanguage(next){if(!supported.includes(next))return;language=next;try{localStorage.setItem(storageKey,language);}catch{}apply();if(typeof refreshLanguage==='function')refreshLanguage();}
 document.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>setLanguage(button.dataset.language));
 apply();return {t,setLanguage,get language(){return language;}};
})();
