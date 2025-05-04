'use client';

import { useState, useEffect } from 'react';
import useContractInteraction from '@/lib/useContractInteraction';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#34D399', '#6EE7B7', '#A7F3D0'];
const formatDate = timestamp => timestamp ? new Date(parseInt(timestamp) * 1000).toLocaleString() : 'N/A';

const ChartCard = ({ children, title }) => (
  <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
    {title && <h3 className="text-lg font-medium text-green-700 mb-4">{title}</h3>}
    <div className="h-64">{children}</div>
  </div>
);

const ResultsTable = ({ title, data, nameKey, valueKey, total }) => (
  <div>
    <h3 className="text-xl font-semibold text-green-800 mb-4">{title}</h3>
    <div className="bg-white border border-green-200 rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-green-200">
        <thead className="bg-green-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-green-800 uppercase tracking-wider">Votes</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-green-800 uppercase tracking-wider">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-green-200">
          {data.length > 0 ? data.map((item, i) => {
            const percentage = total ? Math.round((parseInt(item[valueKey]) / total) * 100) : 0;
            return (
              <tr key={i} className={i % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item[nameKey]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">{item[valueKey]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                  {percentage}%
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function ResultsPage() {
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionsList, setElectionsList] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [candidateVotes, setCandidateVotes] = useState([]);
  const [locationVotes, setLocationVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { getElections, getElectionDetails, getAllCandidateVotesForElection, getAllLocationVotesForElection } = useContractInteraction();

  const fetchElectionResults = async (electionId) => {
    try {
      setLoading(true);
      setError('');
      
      const [candidateResult, locationResult, electionDetails] = await Promise.all([
        getAllCandidateVotesForElection(electionId),
        getAllLocationVotesForElection(electionId),
        getElectionDetails(electionId)
      ]);
      
      if (candidateResult.success) setCandidateVotes(candidateResult.candidateVotes);
      else setError('Failed to load candidate votes');
      
      if (locationResult.success) setLocationVotes(locationResult.locationVotes);
      else setError(prev => prev ? `${prev}. Failed to load location votes` : 'Failed to load location votes');
      
      if (electionDetails.success) setSelectedElection(electionDetails.election);
      else setError(prev => prev ? `${prev}. Failed to load election details` : 'Failed to load election details');
    } catch (err) {
      setError('Error loading election results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { success, elections } = await getElections(0, 100);
        if (success && elections.length) {
          const sortedElections = [...elections].sort((a, b) => parseInt(b.startTime) - parseInt(a.startTime));
          setElectionsList(sortedElections);
          setFilteredElections(sortedElections);
          
          const now = Date.now() / 1000;
          const completedElection = sortedElections.find(e => now > parseInt(e.endTime)) || sortedElections[0];
          
          if (completedElection) {
            setSelectedElection(completedElection);
            await fetchElectionResults(completedElection.id);
          }
        } else {
          setError(success ? 'No elections found' : 'Failed to load elections');
        }
      } catch (err) {
        setError('An error occurred while loading elections');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getElections]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = electionsList.filter(election =>
        election.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.electionType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredElections(filtered);
      
      if (filtered.length && selectedElection && !filtered.find(e => e.id === selectedElection.id)) {
        setSelectedElection(filtered[0]);
        fetchElectionResults(filtered[0].id);
      }
    } else {
      setFilteredElections(electionsList);
    }
  }, [searchTerm, electionsList, selectedElection]);

  const getElectionStatus = (election) => {
    if (!election) return { text: '', isCompleted: false };
    const now = Date.now() / 1000;
    if (now > parseInt(election.endTime)) return { text: 'Completed', isCompleted: true };
    if (now > parseInt(election.startTime)) return { text: 'Active', isCompleted: false };
    return { text: 'Upcoming', isCompleted: false };
  };

  const handleElectionChange = (e) => {
    const electionId = e.target.value;
    const election = filteredElections.find(el => el.id.toString() === electionId);
    if (election) {
      setSelectedElection(election);
      fetchElectionResults(electionId);
    }
  };

  const electionStatus = getElectionStatus(selectedElection);
  const isElectionCompleted = electionStatus.isCompleted;
  const totalVotes = isElectionCompleted ? candidateVotes.reduce((sum, cv) => sum + parseInt(cv.votes), 0) : 0;
  const sortedCandidates = isElectionCompleted ? [...candidateVotes].sort((a, b) => parseInt(b.votes) - parseInt(a.votes)) : [];
  const sortedLocations = isElectionCompleted ? [...locationVotes].sort((a, b) => parseInt(b.votes) - parseInt(a.votes)) : [];

  const pieChartData = sortedCandidates.map(c => ({ name: c.name, value: parseInt(c.votes) }));
  const candidateBarData = sortedCandidates.map(c => ({ name: c.name.length > 10 ? `${c.name.substring(0, 10)}...` : c.name, votes: parseInt(c.votes) }));
  const locationBarData = sortedLocations.map(l => ({ name: l.location.length > 10 ? `${l.location.substring(0, 10)}...` : l.location, votes: parseInt(l.votes) }));

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Election Results</h1>
        
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="election-select" className="block text-sm font-medium text-green-700 mb-2">
                Select Election
              </label>
              <select
                id="election-select"
                className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleElectionChange}
                value={selectedElection?.id || ''}
                disabled={loading || !filteredElections.length}
              >
                {filteredElections.map(election => (
                  <option key={election.id} value={election.id}>
                    {election.name} ({election.electionType}) - {getElectionStatus(election).text}
                  </option>
                ))}
              </select>
              {filteredElections.length === 0 && searchTerm && (
                <p className="mt-2 text-sm text-red-600">No matching elections found</p>
              )}
            </div>
            <div>
              <label htmlFor="election-search" className="block text-sm font-medium text-green-700 mb-2">
                Search Elections
              </label>
              <form onSubmit={(e) => { e.preventDefault(); setSearchTerm(searchInputValue); }} className="relative">
                <div className="flex">
                  <input
                    id="election-search"
                    type="text"
                    placeholder="Search by name or type and press Enter"
                    className="w-full px-4 py-2 border border-green-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setSearchTerm(searchInputValue))}
                    disabled={loading || !electionsList.length}
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading || !electionsList.length}
                  >
                    Search
                  </button>
                </div>
                {searchTerm && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600">Showing results for: "{searchTerm}"</span>
                    <button
                      onClick={() => { setSearchInputValue(''); setSearchTerm(''); }}
                      className="ml-2 text-sm text-red-600 hover:text-red-800"
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
          ) : selectedElection ? (
            <>
              <div className="bg-green-100 rounded-lg p-4 mb-8">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Election Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p><span className="font-medium">Name:</span> {selectedElection.name}</p>
                    <p><span className="font-medium">Type:</span> {selectedElection.electionType}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Start:</span> {formatDate(selectedElection.startTime)}</p>
                    <p><span className="font-medium">End:</span> {formatDate(selectedElection.endTime)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Status:</span> {electionStatus.text}</p>
                    {isElectionCompleted && (
                      <p><span className="font-medium">Total Votes:</span> {selectedElection.totalVotes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {!isElectionCompleted ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Results are only available after the election has ended.
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This election will end on {formatDate(selectedElection.endTime)}.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-green-800 mb-4">Vote Distribution Overview</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ChartCard title="Candidate Vote Share">
                        {pieChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie 
                                data={pieChartData} 
                                cx="50%" 
                                cy="50%" 
                                labelLine={false} 
                                outerRadius={80}
                                fill="#8884d8" 
                                dataKey="value" 
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {pieChartData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} votes`, 'Count']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-500">
                            No candidate votes recorded
                          </div>
                        )}
                      </ChartCard>
                      
                      <ChartCard title="Candidate Vote Count">
                        {candidateBarData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={candidateBarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="votes" fill="#10B981">
                                {candidateBarData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-500">
                            No candidate votes recorded
                          </div>
                        )}
                      </ChartCard>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-green-800 mb-4">Location Vote Distribution</h2>
                    <ChartCard>
                      {locationBarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={locationBarData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="votes" fill="#065F46">
                              {locationBarData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[(i+2) % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No location votes recorded
                        </div>
                      )}
                    </ChartCard>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultsTable 
                      title="Candidate Results" 
                      data={sortedCandidates} 
                      nameKey="name" 
                      valueKey="votes" 
                      total={totalVotes} 
                    />
                    <ResultsTable 
                      title="Location Results" 
                      data={sortedLocations} 
                      nameKey="location" 
                      valueKey="votes" 
                      total={totalVotes} 
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No elections found. Please create an election first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}