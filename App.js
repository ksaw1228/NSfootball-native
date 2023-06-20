import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgUri } from 'react-native-svg';
import axios from 'axios';


function MainApp() {
  const dayUnicord = 86400000
  const plLogo = 'https://crests.football-data.org/PL.png'
  const blLogo = 'https://crests.football-data.org/BL1.png'
  const pdLogo = 'https://crests.football-data.org/PD.png'
  const saLogo = 'https://crests.football-data.org/SA.png'
  const fl1Logo = 'https://crests.football-data.org/FL1.png'

  const [date, setDate] = useState(new Date().getTime());
  const [pl, setPl] = useState([])
  const [bl,setBl] = useState([])
  const [fl1,setFl1] = useState([])
  const [pd,setPd] = useState([])
  const [sa,setSa] = useState([])
  const [scoreFlip, setScoreFlip] = useState(false)
  const [swipeHandled, setSwipeHandled] = useState(false);


  const lastDragX = useRef(0);

  const onSwipeGesture = (event) => {
    const { translationX } = event.nativeEvent;
  
    if (!swipeHandled) {
      if (translationX - lastDragX.current > 50) {
        onSwipeRight();
        lastDragX.current = translationX;
        setSwipeHandled(true);
      } else if (translationX - lastDragX.current < -50) {
        onSwipeLeft();
        lastDragX.current = translationX;
        setSwipeHandled(true);
      }
    }
  };
  
  const onSwipeGestureStateChange = (event) => {
    if (event.nativeEvent.oldState === 4) {
      lastDragX.current = 0;
      setSwipeHandled(false);
    }
  };

  const onSwipeLeft = () => {
    setDate(date + dayUnicord);
  };

  const onSwipeRight = () => {
    setDate(date - dayUnicord);
  };
  
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


  function addLeague(leagueName){
    const arr = []
    for(let i = 0; i < leagueName.length; i++) {
      arr.push({
        id: leagueName[i].id,
        date: new Date(leagueName[i].Date).getTime(),
        matchday: leagueName[i].Matchday,
        homeTeam: leagueName[i].Home,
        homeTeamIco: leagueName[i].HomeIco,
        awayTeam: leagueName[i].Away,
        awayTeamIco: leagueName[i].AwayIco,
        score: leagueName[i].Score==='null:null' ? '? : ?' : leagueName[i].Score,
      })
    }
    return arr
  }

  async function getData() {
    try{
      const response = await axios.get('http://35.211.105.95/api/all');
      const data = response.data
      setPl(addLeague(data.PL))
      setBl(addLeague(data.BL))
      setFl1(addLeague(data.FL1))
      setPd(addLeague(data.PD))
      setSa(addLeague(data.SA))
    }catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    getData(getDate(date))
  }, []);

  function renderLeague(leagueLogo,matches,width,height,backgroundColor='teal'){
    return(
      <View style={styles.leagueTable}>
      <View style={{alignItems:'center',backgroundColor:'#5EA152',borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
        <Image source={{uri:leagueLogo}} style={{width:40,height: 40,marginBottom:5,marginTop:5}}/>
      </View>
      {matches.filter((i) => getDate(i.date) === getDate(date)).map((i) => (
        <TouchableOpacity key={i.id} style={styles.matchCard}>
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
    <Text style={{ ...styles.noMatches, display: matches.filter((i) => getDate(i.date) === getDate(date)).length === 0 ? '' : "none" }}>No matches today.</Text>
      </View>
    )
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
          {renderLeague(plLogo,pl,100,45,'skyblue')}
          {renderLeague(pdLogo,pd,150,45,'white')}
          {renderLeague(blLogo,bl,150,45,'white')}
          {renderLeague(saLogo,sa,170,45,'white')}
          {renderLeague(fl1Logo,fl1,100,45,'skyblue')}
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
  },
  headLogo: {
    backgroundColor: '#1F1F1F',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    color: '#5EA152',
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
    marginTop: 30,
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
    backgroundColor:'#5EA152',
    alignContent:'center',
    justifyContent:'center',
    borderRadius: 25,

  },
  scoreOnOffText: {
    fontSize: 10,
    color: 'white',
  },
  leagueTable: {
    marginBottom: 30,
    // marginBottom: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: '#5EA152'
  }
});
