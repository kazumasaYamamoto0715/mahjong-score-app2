import React, { useState, useEffect } from 'react';

export default function App() {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [date, setDate] = useState('');
  const [roundScores, setRoundScores] = useState(Array(4).fill(0));
  const [roundPlayers, setRoundPlayers] = useState(Array(4).fill(''));

  // 初期化
  useEffect(() => {
    const savedPlayers = JSON.parse(localStorage.getItem('players')) || [];
    if (savedPlayers.length === 0) {
      const defaultPlayers = Array.from({ length: 20 }, (_, i) => ({ name: `プレイヤー${i+1}`, total: 0, games: 0 }));
      setPlayers(defaultPlayers);
      localStorage.setItem('players', JSON.stringify(defaultPlayers));
    } else {
      setPlayers(savedPlayers);
    }
    setScores(JSON.parse(localStorage.getItem('scores')) || []);
  }, []);

  // 成績保存
  const saveScore = () => {
    if (!date || roundPlayers.some(p => !p)) return alert('日付とプレイヤーを入力してください');
    const newScores = [...scores, { date, players: roundPlayers, scores: roundScores.map(Number) }];
    localStorage.setItem('scores', JSON.stringify(newScores));
    setScores(newScores);
    // 合計更新
    const updatedPlayers = [...players];
    roundPlayers.forEach((pname, idx) => {
      const pIndex = updatedPlayers.findIndex(p => p.name === pname);
      if (pIndex >= 0) {
        updatedPlayers[pIndex].total += Number(roundScores[idx]);
        updatedPlayers[pIndex].games += 1;
      }
    });
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));
  };

  // 成績削除
  const deleteScore = (index) => {
    const removed = scores[index];
    const updatedPlayers = [...players];
    removed.players.forEach((pname, idx) => {
      const pIndex = updatedPlayers.findIndex(p => p.name === pname);
      if (pIndex >= 0) {
        updatedPlayers[pIndex].total -= Number(removed.scores[idx]);
        updatedPlayers[pIndex].games -= 1;
      }
    });
    setPlayers(updatedPlayers);
    localStorage.setItem('players', JSON.stringify(updatedPlayers));

    const newScores = scores.filter((_, i) => i !== index);
    setScores(newScores);
    localStorage.setItem('scores', JSON.stringify(newScores));
  };

  const ranking = [...players].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-600">麻雀成績入力アプリ</h1>

      <div className="mb-4">
        <label className="block">対局日:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-1"/>
      </div>

      {[0,1,2,3].map(i => (
        <div key={i} className="mb-2">
          <select value={roundPlayers[i]} onChange={e => {
            const newArr = [...roundPlayers];
            newArr[i] = e.target.value;
            setRoundPlayers(newArr);
          }} className="border p-1 mr-2">
            <option value="">プレイヤー選択</option>
            {players.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <input type="number" value={roundScores[i]} onChange={e => {
            const newArr = [...roundScores];
            newArr[i] = e.target.value;
            setRoundScores(newArr);
          }} className="border p-1 w-20"/>
        </div>
      ))}

      <button onClick={saveScore} className="bg-green-500 text-white px-4 py-2 rounded">保存</button>

      <h2 className="text-xl font-bold mt-6 mb-2">成績一覧</h2>
      {scores.map((s, i) => (
        <div key={i} className="border p-2 mb-2">
          <div>{s.date}</div>
          {s.players.map((pname, idx) => (
            <div key={idx}>{pname}: {s.scores[idx]}</div>
          ))}
          <button onClick={() => deleteScore(i)} className="bg-red-500 text-white px-2 py-1 mt-2">削除</button>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">ランキング</h2>
      {ranking.map((p, idx) => (
        <div key={p.name} className="flex justify-between border-b py-1">
          <span>{idx+1}位: {p.name}</span>
          <span>{p.total}点 ({p.games}局)</span>
        </div>
      ))}
    </div>
  );
}
