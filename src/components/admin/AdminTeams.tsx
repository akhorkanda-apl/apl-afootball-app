import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Users, ChevronDown, ChevronUp, X, Check, Shield } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { Player, PlayerPosition, Team } from '../../types/tournament';

export const AdminTeams: React.FC = () => {
  const {
    teams,
    activeTournament,
    addGroup,
    renameGroup,
    deleteGroup,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
  } = useTournament();

  // Group Management State
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupOldName, setEditingGroupOldName] = useState<string | null>(null);
  const [editingGroupNewName, setEditingGroupNewName] = useState('');

  // Team Form State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamShortName, setTeamShortName] = useState('');
  const [teamGroup, setTeamGroup] = useState(activeTournament.groups[0] || 'গ্রুপ ক');
  const [teamColor, setTeamColor] = useState('#10b981');
  const [teamLogoUrl, setTeamLogoUrl] = useState('');
  const [teamManagerName, setTeamManagerName] = useState('');
  const [teamManagerPhone, setTeamManagerPhone] = useState('');

  // Player Form State
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [targetTeamIdForPlayer, setTargetTeamIdForPlayer] = useState<string>('');
  const [playerName, setPlayerName] = useState('');
  const [playerJersey, setPlayerJersey] = useState<number>(10);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>('ফরওয়ার্ড');

  // Groups actions
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    addGroup(newGroupName.trim());
    setNewGroupName('');
  };

  const handleSaveRenameGroup = (oldName: string) => {
    if (!editingGroupNewName.trim()) return;
    renameGroup(oldName, editingGroupNewName.trim());
    setEditingGroupOldName(null);
    setEditingGroupNewName('');
  };

  const handleDeleteGroup = (groupName: string) => {
    const teamsInGroup = teams.filter((t) => t.group === groupName);
    if (teamsInGroup.length > 0) {
      if (!window.confirm(`সতর্কতা: '${groupName}' এ ${teamsInGroup.length}টি দল রয়েছে। গ্রুপটি মুছে ফেললে দলগুলোর গ্রুপ খালি হয়ে যাবে। আপনি কি নিশ্চিত?`)) {
        return;
      }
    }
    deleteGroup(groupName);
  };

  // Team actions
  const handleOpenTeamModal = (team?: Team) => {
    if (team) {
      setEditingTeamId(team.id);
      setTeamName(team.name);
      setTeamShortName(team.shortName);
      setTeamGroup(team.group);
      setTeamColor(team.color);
      setTeamLogoUrl(team.logoUrl || '');
      setTeamManagerName(team.managerName || '');
      setTeamManagerPhone(team.managerPhone || '');
    } else {
      setEditingTeamId(null);
      setTeamName('');
      setTeamShortName('');
      setTeamGroup(activeTournament.groups[0] || 'গ্রুপ ক');
      setTeamColor('#10b981');
      setTeamLogoUrl('');
      setTeamManagerName('');
      setTeamManagerPhone('');
    }
    setShowTeamModal(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamShortName.trim()) return;

    if (editingTeamId) {
      updateTeam(editingTeamId, {
        name: teamName.trim(),
        shortName: teamShortName.trim().toUpperCase(),
        group: teamGroup,
        color: teamColor,
        logoUrl: teamLogoUrl.trim() || undefined,
        managerName: teamManagerName.trim() || undefined,
        managerPhone: teamManagerPhone.trim() || undefined,
      });
    } else {
      addTeam({
        name: teamName.trim(),
        shortName: teamShortName.trim().toUpperCase(),
        group: teamGroup,
        color: teamColor,
        logoUrl: teamLogoUrl.trim() || undefined,
        managerName: teamManagerName.trim() || undefined,
        managerPhone: teamManagerPhone.trim() || undefined,
      });
    }
    setShowTeamModal(false);
  };

  const handleDeleteTeam = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে '${name}' দলটি মুছে ফেলতে চান? সংশ্লিষ্ট ম্যাচের ফলাফল প্রভাবিত হতে পারে।`)) {
      deleteTeam(id);
    }
  };

  // Player actions
  const handleOpenPlayerModal = (teamId: string, player?: Player) => {
    setTargetTeamIdForPlayer(teamId);
    if (player) {
      setEditingPlayerId(player.id);
      setPlayerName(player.name);
      setPlayerJersey(player.jerseyNumber);
      setPlayerPosition(player.position);
    } else {
      setEditingPlayerId(null);
      setPlayerName('');
      setPlayerJersey(Math.floor(Math.random() * 20) + 1);
      setPlayerPosition('ফরওয়ার্ড');
    }
    setShowPlayerModal(true);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !targetTeamIdForPlayer) return;

    if (editingPlayerId) {
      updatePlayer(targetTeamIdForPlayer, editingPlayerId, {
        name: playerName.trim(),
        jerseyNumber: Number(playerJersey) || 1,
        position: playerPosition,
      });
    } else {
      addPlayer(targetTeamIdForPlayer, {
        name: playerName.trim(),
        jerseyNumber: Number(playerJersey) || 1,
        position: playerPosition,
      });
    }
    setShowPlayerModal(false);
  };

  const handleDeletePlayer = (teamId: string, playerId: string) => {
    if (window.confirm('এই খেলোয়াড়কে তালিকা থেকে মুছে ফেলতে চান?')) {
      deletePlayer(teamId, playerId);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Dynamic Groups Section */}
      <div className="rounded-2xl bg-[#061e18] border border-emerald-900/60 p-4 shadow space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>টুর্নামেন্ট গ্রুপ ব্যবস্থাপনা</span>
          </h3>
          <span className="text-xs text-slate-400">মোট গ্রুপ: {activeTournament.groups.length}টি</span>
        </div>

        {/* Existing Groups Pill List */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTournament.groups.map((g) => {
            const isEditing = editingGroupOldName === g;
            return (
              <div
                key={g}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#082b22] border border-emerald-700/50 text-xs text-slate-100"
              >
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingGroupNewName}
                      onChange={(e) => setEditingGroupNewName(e.target.value)}
                      className="bg-slate-900 px-2 py-0.5 rounded text-white text-xs border border-emerald-500 w-24"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRenameGroup(g)}
                      className="text-emerald-400 hover:text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingGroupOldName(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-amber-300">{g}</span>
                    <button
                      onClick={() => {
                        setEditingGroupOldName(g);
                        setEditingGroupNewName(g);
                      }}
                      className="text-slate-400 hover:text-white ml-1"
                      title="নাম পরিবর্তন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {activeTournament.groups.length > 1 && (
                      <button
                        onClick={() => handleDeleteGroup(g)}
                        className="text-red-400 hover:text-red-300 ml-0.5"
                        title="গ্রুপ মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Group input */}
        <form onSubmit={handleAddGroup} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="নতুন গ্রুপের নাম (যেমন: গ্রুপ সি)..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 min-h-[40px] bg-[#051813] border border-emerald-800 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>গ্রুপ যোগ</span>
          </button>
        </form>
      </div>

      {/* 2. Teams & Rosters Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">অংশগ্রহণকারী দল ও খেলোয়াড় তালিকা</h3>
            <p className="text-xs text-slate-400">মোট দল: {teams.length}টি</p>
          </div>
          <button
            onClick={() => handleOpenTeamModal()}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন দল যুক্ত করুন</span>
          </button>
        </div>

        {/* Teams List */}
        <div className="space-y-3">
          {teams.map((t) => {
            const isExpanded = expandedTeamId === t.id;
            return (
              <div
                key={t.id}
                className="rounded-2xl bg-[#061d17] border border-emerald-900/60 overflow-hidden shadow-sm"
              >
                {/* Team Summary Bar */}
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white text-sm shadow shrink-0"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.shortName}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {t.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-semibold">{t.group}</span>
                        <span>·</span>
                        <span>খেলোয়াড়: {t.players.length} জন</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenPlayerModal(t.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/40 text-xs font-semibold flex items-center gap-1"
                      title="খেলোয়াড় যোগ করুন"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">খেলোয়াড়</span>
                    </button>
                    <button
                      onClick={() => handleOpenTeamModal(t)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/80 rounded-lg"
                      title="সম্পাদনা"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(t.id, t.name)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-red-400 hover:text-red-300 bg-red-950/60 rounded-lg"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/60 rounded-lg ml-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Player Squad Roster */}
                {isExpanded && (
                  <div className="bg-[#051611] p-3 border-t border-emerald-950/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 px-1 pb-1">
                      <span>খেলোয়াড় স্কোয়াড তালিকা ({t.players.length} জন)</span>
                      <button
                        onClick={() => handleOpenPlayerModal(t.id)}
                        className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Plus className="w-3 h-3" />
                        <span>নতুন খেলোয়াড় যোগ</span>
                      </button>
                    </div>

                    {t.players.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2 text-center">
                        এই দলে এখনও কোনো খেলোয়াড় যোগ করা হয়নি।
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {t.players.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#08251e] border border-emerald-900/30 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center font-display font-bold text-amber-400 text-[11px] shrink-0 border border-slate-700">
                                #{p.jerseyNumber}
                              </span>
                              <div className="min-w-0">
                                <span className="font-bold text-white truncate block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {p.position}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenPlayerModal(t.id, p)}
                                className="text-slate-400 hover:text-white p-1"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(t.id, p.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Create/Edit Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTeamId ? 'দল সম্পাদনা করুন' : 'নতুন দল যুক্ত করুন'}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  দলের পূর্ণ নাম:
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আখরকান্দা স্পোর্টিং ক্লাব"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    শর্ট কোড (৩ অক্ষর):
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="ASC"
                    value={teamShortName}
                    onChange={(e) => setTeamShortName(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white uppercase font-display"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    গ্রুপ:
                  </label>
                  <select
                    value={teamGroup}
                    onChange={(e) => setTeamGroup(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-2.5 text-xs text-white"
                  >
                    {activeTournament.groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  জার্সি / থিম রঙ:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="w-12 h-11 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="flex-1 min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Add/Edit Modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPlayerId ? 'খেলোয়াড় তথ্য সম্পাদনা' : 'নতুন খেলোয়াড় যোগ করুন'}
              </h3>
              <button onClick={() => setShowPlayerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  খেলোয়াড়ের পুরো নাম:
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শাকিল আহমেদ"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    জার্সি নম্বর:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={playerJersey}
                    onChange={(e) => setPlayerJersey(parseInt(e.target.value, 10))}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    খেলার পজিশন:
                  </label>
                  <select
                    value={playerPosition}
                    onChange={(e) => setPlayerPosition(e.target.value as PlayerPosition)}
                    className="w-full min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl px-2.5 text-xs text-white"
                  >
                    <option value="ফরওয়ার্ড">ফরওয়ার্ড</option>
                    <option value="মিডফিল্ডার">মিডফিল্ডার</option>
                    <option value="ডিফেন্ডার">ডিফেন্ডার</option>
                    <option value="গোলকিপার">গোলকিপার</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlayerModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
