import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect} from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Image, ScrollView,ImageBackground,Modal, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView,FlingGestureHandler,Directions, } from 'react-native-gesture-handler';
import { SvgUri } from 'react-native-svg';
import axios from 'axios';
import {Calendar} from 'react-native-calendars';


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
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
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
      const response = await axios.get('http://35.211.166.163/api/all');
      const data = response.data
      setPl(addLeague(data.PL))
      setBl(addLeague(data.BL1))
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

  function renderLeague(leagueLogo,matches){
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
    <Text style={{ ...styles.noMatches, display: matches.filter((i) => getDate(i.date) === getDate(date)).length === 0 ? 'flex' : "none" }}>No matches today.</Text>
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
          <TouchableOpacity style={{...styles.dateTouch}} onPress={toggleModal}>
          <ImageBackground
        style={{height:35,width:35}}
        resizeMode="cover"
        source={require('./assets/calPlaneSmall.png')}
      >
            <Text></Text>
            <Text style={{...styles.dateText,color:'white',textAlign:'center'}}>{getDate(date).slice(-2)}</Text>
            </ImageBackground>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateTouch} onPress={()=>setDate(date + dayUnicord)}>
            <Text style={styles.dateText}>{getDate(date + dayUnicord).replace(/^[^-]+-(\d{2}-\d{2})$/, '$1')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <TouchableWithoutFeedback onPress={toggleModal}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <Calendar
                    style={styles.calendar}
                    current={new Date(date).toISOString().substring(0, 10)}
                    onDayPress={i=>{
                      setDate(i.timestamp)
                      toggleModal()
                    }}
                    markedDates={{
                      [getDate(date, false)]: {
                        selected: true,
                        selectedColor: "#5EA152",
                      },
                    }}
                    theme={{
                      todayTextColor: "#5EA152",
                      selectedDayBackgroundColor: "#5EA152",
                    }}
                    // monthFormat={'yyyy-M'}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
      </Modal>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
      direction={Directions.RIGHT}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === 4) onSwipeRight();
      }}
    >
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 4)  onSwipeLeft();
        }}
      >
          <ScrollView style={styles.main} ref={(ref) => (this.scrollview = ref)} id={"scrollview"} nestedScrollEnabled={true}>
          {renderLeague(plLogo,pl)}
          {renderLeague(pdLogo,pd)}
          {renderLeague(blLogo,bl)}
          {renderLeague(saLogo,sa)}
          {renderLeague(fl1Logo,fl1)}
          </ScrollView>
      </FlingGestureHandler>
    </FlingGestureHandler>
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
  },
   modalBackground: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 15,
      width: '100%',
      height: '50%',
    },
    calendar: {
      borderRadius: 10,
    },
});
