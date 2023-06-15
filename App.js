import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgUri } from 'react-native-svg';


function MainApp() {
  const dayUnicord = 86400000
  const [date, setDate] = useState(new Date().getTime());
  const [matches, setMatches] = useState([])
  const [flip, setFlip] = useState(true)
  const [scoreFlip, setScoreFlip] = useState(false)

  

  const lastDragX = useRef(0);

  const onSwipeGesture = (event) => {
    const {translationX} = event.nativeEvent;
  
    if (translationX - lastDragX.current > 100) {
      onSwipeRight();
      lastDragX.current = translationX;
    } else if (translationX - lastDragX.current < -100) {
      onSwipeLeft();
      lastDragX.current = translationX;
    }
  };
  
  const onSwipeGestureStateChange = (event) => {
    if (event.nativeEvent.oldState === 4) {
      lastDragX.current = 0;
    }
  };

  useEffect(() => {
    getData(getDate(date))
  }, []);

  useEffect(() => {
    if (matches.filter((i) => getDate(i.date) === getDate(date)).length === 0) {
      setFlip(false);
    } else {
      setFlip(true);
    }
  }, [matches, date]);
  
  function getDate(unixTime, showHour = false) {
    const date = new Date(unixTime);

    if (showHour === false) {
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      if (month < 10) {
        month = '0' + month;
      }
        if (day < 10) {
        day = '0' + day;
      }
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    } else {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      if (hours < 10) {
        hours = '0' + hours;
      }
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      const formattedDateTime = `${hours}:${minutes}`;
      return formattedDateTime;
    }
  }

  const onSwipeLeft = () => {
    setDate(date + dayUnicord);
  };

  const onSwipeRight = () => {
    setDate(date - dayUnicord);
  };

  async function getData(date) {
    const API_KEY = "56c117f5b9b44f6385bd8911d6ad8ebc"
    url = `https://api.football-data.org/v4/competitions/PL/matches?season=2022`;
    const headers = { "X-Auth-Token": API_KEY};
    try {
      const response = await axios.get(url, { headers: headers });
      const total = response.data.matches
      const PL = []

      for(let i = 0; i < total.length; i++) {
        PL.push({
          date: new Date(total[i].utcDate).getTime(),
          matchday: total[i].matchday,
          homeTeam: total[i].homeTeam.shortName,
          homeTeamIco: total[i].homeTeam.crest,
          awayTeam: total[i].awayTeam.shortName,
          awayTeamIco: total[i].awayTeam.crest,
          score: `${total[i].score.fullTime.home}:${total[i].score.fullTime.away}`,
        })
      }
      setMatches(PL)
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <View style={styles.headLogo}>
          <Text style={styles.title}>NS<Text style={{...styles.title,color:'white',fontSize:25}}>football</Text></Text>
          <TouchableOpacity onPress={()=>{
            if (scoreFlip === true) {
              setScoreFlip(false)
            } else {
              setScoreFlip(true)
            }
          }} style={styles.scoreOnOff}>
            <Text style={{...styles.scoreOnOffText,color:'white'}}>{scoreFlip ? 'Hide' : 'Show'}<Text style={styles.scoreOnOffText}> Scores</Text></Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headDate}>
          <TouchableOpacity style={styles.dateTouch} onPress={()=>setDate(date - dayUnicord)}>
            <Text style={styles.dateText}>{getDate(date - dayUnicord).replace(/^[^-]+-(\d{2}-\d{2})$/, '$1')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateTouch}>
            <Text style={{...styles.dateText,color:'white'}}>{getDate(date).replace(/^[^-]+-(\d{2}-\d{2})$/, '$1')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateTouch} onPress={()=>setDate(date + dayUnicord)}>
            <Text style={styles.dateText}>{getDate(date + dayUnicord).replace(/^[^-]+-(\d{2}-\d{2})$/, '$1')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
          onGestureEvent={onSwipeGesture}
          onHandlerStateChange={onSwipeGestureStateChange}
        >
          <ScrollView style={styles.main}>
            {matches.filter((i) => getDate(i.date) === getDate(date)).map((i) => (
              <TouchableOpacity key={i} style={styles.matchCard}>
                <View style={styles.matchTopView}>
                  <Text style={styles.matchTime}>
                    {getDate(i.date, true)}
                  </Text>
                </View>
                <View style={styles.matchBotView}>
                  <View style={styles.matchHome}>
                    <Text style={styles.teamName}>
                      {i.homeTeam}  {
                        i.homeTeamIco.endsWith('.svg') ? (<SvgUri width="20" height="20" uri={i.homeTeamIco} />) : (<Image source={{ uri: i.homeTeamIco }} style={styles.teamLogo} />)
                      }
                    </Text>
                  </View>
                  <Text style={styles.matchScore}>{scoreFlip ? i.score : '     '}</Text>
                  <View style={styles.matchAway}>
                    <Text style={styles.teamName}>
                      {
                        i.awayTeamIco.endsWith('.svg') ? (<SvgUri width="20" height="20" uri={i.awayTeamIco} />) : (<Image source={{ uri: i.awayTeamIco }} style={styles.teamLogo} />)
                      } {i.awayTeam}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
            }
            <Text style={{ ...styles.noMatches, display: flip ? 'none' : "" }}>No matches today.</Text>
          </ScrollView>
        </PanGestureHandler>
      </GestureHandlerRootView>
      <StatusBar style='auto' />
    </SafeAreaView>


  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  header: {
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#4D4D4D',
    // marginBottom:10
  },
  headLogo: {
    backgroundColor: '#1F1F1F',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    color: 'teal',
    fontSize: 30,
    fontWeight: 'bold',
  },
  headDate: {
    backgroundColor: '#1F1F1F',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  main: {
    flexGrow: 1,
  },
  matchCard: {
    marginBottom: 10,
    paddingBottom: 10,
    backgroundColor: '#383838',
    borderBottom: 1,
    borderBottomColor: '#4D4D4D',
  },
  matchTopView: {
    alignItems: 'center',
    marginBottom: 5,
  },
  matchTime: {
    fontSize: 20,
    color: '#A0A0A0',
  },
  matchBotView: {
    flexDirection: 'row',
  },
  matchHome: {
    flex: 1,
    alignItems: 'flex-end',
  },
  matchAway: {
    flex: 1,
  },
  matchScore: {
    marginHorizontal: 5,
    fontSize: 20,
    color: '#FFFFFF',
  },
  teamName: {
    fontSize: 18,
    color:'#FFFFFF',
  },
  teamLogo: {
    width: 20,
    height: 20,
  },
  noMatches: {
    textAlign: 'center',
    fontSize: 20,
    color: '#A0A0A0',
    marginTop: 60,
  },
  dateText: {
    fontSize: 18,
    color: '#A0A0A0',
  },
  dateTouch: {
    padding: 15,
  },
  scoreOnOff: {
    marginTop: 10,
    padding: 10,
    height:30,
    backgroundColor:'teal',
    alignContent:'center',
    justifyContent:'center',
    borderRadius: 25,

  },
  scoreOnOffText: {
    fontSize: 10,
    color: '#A0A0A0',
  }
});
