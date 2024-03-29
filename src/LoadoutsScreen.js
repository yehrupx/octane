import React, { useState, useEffect, createContext, useContext } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Card, Text, Layout, useTheme, TopNavigation, TopNavigationAction, Icon, Input, Button, Spinner, ListItem, Radio, RadioGroup } from '@ui-kitten/components';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import uuid from 'react-native-uuid';
import Modal from 'react-native-modal';
import ProgressBar from 'react-native-progress/Bar';

import { PrimaryWeaponsScreen, SecondaryWeaponsScreen } from './WeaponsScreen';
import { Perk1Screen, Perk2Screen, Perk3Screen, LethalScreen, TacticalScreen } from './SelectorScreen';
import { PRIMARY, SECONDARY, PERK1, PERK2, PERK3, LETHAL, TACTICAL } from './Equipment';
import { ATTACHIMG } from './Gunsmith';
import { acc } from 'react-native-reanimated';

const TopNav = createMaterialTopTabNavigator();
const StackNav = createStackNavigator();

const UserContext = createContext();
const GunsmithContext = createContext();

const MenuIcon = (props) => (
  <Icon {...props} name='menu-outline'/>
);

const BackIcon = (props) => (
  <Icon {...props} name='arrow-back-outline'/>
);

const AddIcon = (props) => (
  <Icon {...props} name='plus-circle-outline'/>
);

const EditIcon = (props) => (
  <Icon {...props} name='edit-2-outline'/>
);

const TrashIcon = (props) => (
  <Icon {...props} name='trash-2-outline'/>
);

const RenderMenuAction = () => {
  const navigation = useNavigation();

  return (
    <TopNavigationAction icon={MenuIcon} onPress={() => navigation.openDrawer()} />
  )
};

const RenderBackAction = () => {
  const navigation = useNavigation();

  return (
    <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
  )
};

const RenderAddAction = () => {
  const navigation = useNavigation();

  const { update } = useContext(UserContext);
  const [ updateState, setUpdateState ] = update;

  const mkLoadout = async ( id ) => {
    await AsyncStorage.setItem(id, JSON.stringify({ name: 'New Loadout', primary: 'AMAX', overkill: 'FENNEC', secondary: 'RENETTI', perk1: 'DOUBLE', perk2: 'OVERKILL', perk3: 'AMPED', lethal: 'FRAG', tactical: 'STIM' }));
  }

  return (
    <TopNavigationAction icon={AddIcon} onPress={async (x, id = uuid.v1()) => { console.log(id); await mkLoadout(id); navigation.push('Builder', { buildId: id, update: setUpdateState }); }} />
  )
};

const RenderLoadoutActions = ({ id, init, set, navigation }) => {
  const { modal, name, nameSetter, delModal, loadoutDel, navBack } = useContext(UserContext);
  const [ modalState, setModalState ] = modal;
  const [ value, setValue ] = name;
  const [ nameSet, setNameSet ] = nameSetter;
  const [ deleteModal, setDelModal ] = delModal;
  const [ loadoutDelete, setloadoutDel ] = loadoutDel;
  const [ navigationBack, setNavBack ] = navBack;

  return (
    <>
      <TopNavigationAction icon={EditIcon} onPress={() => { setValue(init); setNameSet(() => x => set(x)); setModalState(true); }} />
      <TopNavigationAction icon={TrashIcon} onPress={() => { setloadoutDel(() => () => AsyncStorage.removeItem(id)); setNavBack(() => () => navigation.goBack()); setDelModal(true); }} />
    </>
  );
};

const PopularScreen = () => (
  <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text category='h1' style={{textAlign:'center'}}>FIND POPULAR LOADOUTS</Text>
  </Layout>
);

const BuilderScreen = ({ navigation }) => {
  const theme = useTheme();
  const [ loadoutState, setLoadoutState ] = useState([]);

  const { update } = useContext(UserContext);
  const [ updateState, setUpdateState ] = update;

  const initList = async () => {
    let keys = await AsyncStorage.getAllKeys()
    let savedLoadouts = [];
    for (const key of keys) {
      let temp = JSON.parse(await AsyncStorage.getItem(key));
      temp['id'] = key;
      savedLoadouts.push(temp);
    }
    setLoadoutState(savedLoadouts);
  }
  
  if (updateState) {
    initList();
    setUpdateState(false);
  }
  
  return (
    <>
      { loadoutState.length != 0 ?
        <ScrollView style={{ backgroundColor: theme['background-basic-color-1'] }}>
          <Layout style={{ flex: 1, alignItems: 'center' }}>
            {loadoutState.map(loadout =>
              <>
                <Text/>
                <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Builder', { buildId: loadout.id, update: setUpdateState }); }}>
                  <Text category='h6' style={{ textAlign: 'center' }}>{loadout.name}</Text>
                  <Text/>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignContent: 'center' }}>
                      <Text style={{ color: theme['text-hint-color'], textAlign: 'center', paddingTop: '4%', paddingBottom: '4%' }}>Primary</Text>
                      <Image source={PRIMARY[loadout.primary].image} resizeMode='contain' style={{ flex: .5, width: 128, height: 64, alignSelf: 'center' }}/>
                    </View>
                    { loadout.perk2 == 'OVERKILL' ?
                    <View style={{ alignContent: 'center' }}>
                      <Text style={{ color: theme['text-hint-color'], textAlign: 'center', paddingTop: '4%', paddingBottom: '4%' }}>Secondary</Text>
                      <Image source={PRIMARY[loadout.overkill].image} resizeMode='contain' style={{ flex: .5, width: 128, height: 64, alignSelf: 'center' }}/>
                    </View>
                    :
                    <View style={{ alignContent: 'center' }}>
                      <Text style={{ color: theme['text-hint-color'], textAlign: 'center', paddingTop: '4%', paddingBottom: '4%' }}>Secondary</Text>
                      <Image source={SECONDARY[loadout.secondary].image} resizeMode='contain' style={{ flex: .5, width: 128, height: 64, alignSelf: 'center' }}/>
                    </View>
                    }
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ flex: .5 }}>
                      <Text style={{ color: theme['text-hint-color'], textAlign: 'center', paddingTop: '4%', paddingBottom: '4%' }}>Perks</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Image source={PERK1[loadout.perk1].image} resizeMode='contain' style={{ flex: .3, width: 64, height: 64, alignSelf: 'center' }}/>
                        <Image source={PERK2[loadout.perk2].image} resizeMode='contain' style={{ flex: .3, width: 64, height: 64, alignSelf: 'center' }}/>
                        <Image source={PERK3[loadout.perk3].image} resizeMode='contain' style={{ flex: .3, width: 64, height: 64, alignSelf: 'center' }}/>
                      </View>
                    </View>
                    <View style={{ flex: .5 }}>
                      <Text style={{ color: theme['text-hint-color'], textAlign: 'center', paddingTop: '4%', paddingBottom: '4%' }}>Utility</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Image source={LETHAL[loadout.lethal].image} resizeMode='contain' style={{ flex: .3, width: 64, height: 64, alignSelf: 'center' }}/>
                        <Image source={TACTICAL[loadout.tactical].image} resizeMode='contain' style={{ flex: .3, width: 64, height: 64, alignSelf: 'center' }}/>
                      </View>
                    </View>
                  </View>
                </Card>
              </>
            )}
            <Text/>
          </Layout>
        </ScrollView>
      :
        <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text category='h1' style={{textAlign:'center'}}>BUILD A LOADOUT</Text>
        </Layout>
      }
    </>
  );
}

const LoadoutTabNavigator = () => {
  const theme = useTheme();

  return (
    <>
      <TopNavigation
        alignment='center'
        title='Loadouts'
        accessoryLeft={() => <RenderMenuAction />}
        accessoryRight={() => <RenderAddAction />}
      />
      <TopNav.Navigator
        tabBarOptions={{
          activeTintColor: theme['text-primary-color'],
          inactiveTintColor: theme['text-hint-color'],
          indicatorStyle: {  backgroundColor: theme['text-primary-color'], height: 4 },
          labelStyle: { fontWeight: 'bold' },
          style: { backgroundColor: theme['background-basic-color-1'] },
        }}
        style={{ backgroundColor: theme['background-basic-color-1'] }}
      >
        <TopNav.Screen name='Popular' component={PopularScreen}/>
        <TopNav.Screen name='Builder' component={BuilderScreen}/>
      </TopNav.Navigator>
    </>
  );
}

const AssemblyScreen = ({ navigation, route }) => {
  const theme = useTheme();

  const [ loadoutState, setLoadoutState ] = useState({});
  const [ nameState, setNameState ] = useState('');
  const [ initState, setInit ] = useState(false);

  const updateState = ( data ) => {
    setLoadoutState(JSON.parse(JSON.stringify(data)));
  }

  useEffect(() => {
    (async () => {
      if (!initState)
        setLoadoutState(JSON.parse(await AsyncStorage.getItem(route.params.buildId)));
    })();
  }, [initState]);

  useEffect(() => {
    if (!initState && loadoutState.name) {
      setNameState(loadoutState.name);
    }
  }, [loadoutState])

  useEffect(() => {
    if (!initState && nameState && nameState != '') {
      setInit(true);
    }
  }, [nameState])

  useEffect(() => {
    if (initState) {
      const temp = loadoutState;
      temp.name = nameState;
      setLoadoutState(temp);
      AsyncStorage.setItem(route.params.buildId, JSON.stringify(loadoutState));
    }
    route.params.update(true);
  });

  if ( !initState ) {
    return (
      <>
        <TopNavigation
          alignment='center'
          title='Loading...'
          accessoryLeft={() => <RenderBackAction/>}
        />
        <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner status='primary'/>
        </Layout>
      </>
    )
  } else {
    return (
      <>
        <TopNavigation
          alignment='center'
          title={nameState}
          accessoryLeft={() => <RenderBackAction/>}
          accessoryRight={() => <RenderLoadoutActions id={route.params.buildId} init={nameState} set={setNameState} navigation={navigation}/>}
        />
        <ScrollView style={{ backgroundColor: theme['background-basic-color-1'] }}>
          <Layout style={{ flex: 1, alignItems: 'center' }}>
            <Text/>
            <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Primary', { state: loadoutState, setter: updateState, overkill: false } ); }}>
              <Text style={{ color: theme['text-hint-color'], fontSize: 14 }}>Primary Weapon</Text>
              <Text category='h6'>{PRIMARY[loadoutState.primary].title}</Text>
              <Image source={PRIMARY[loadoutState.primary].image} resizeMode='contain' style={{ width: 256, height: 128, alignSelf: 'center' }}/>
              <Text/>
              <Button onPress={() => navigation.push('Gunsmith', { loadout: loadoutState, setter: updateState })}>GUNSMITH</Button>
            </Card>
            { loadoutState.perk2 == 'OVERKILL' ?
            <>
              <Text/>
              <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Primary', { state: loadoutState, setter: updateState, overkill: true } ); }}>
                <Text style={{ color: theme['text-hint-color'], fontSize: 14 }}>Overkill Weapon</Text>
                <Text category='h6'>{PRIMARY[loadoutState.overkill].title}</Text>
                <Image source={PRIMARY[loadoutState.overkill].image} resizeMode='contain' style={{ width: 256, height: 128, alignSelf: 'center' }}/>
                <Text/>
                <Button onPress={() => navigation.push('Gunsmith', { loadout: loadoutState, setter: updateState })}>GUNSMITH</Button>
              </Card>
            </>
            :
            <>
              <Text/>
              <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Secondary', { state: loadoutState, setter: updateState } ); }}>
                <Text style={{ color: theme['text-hint-color'], fontSize: 14 }}>Secondary Weapon</Text>
                <Text category='h6'>{SECONDARY[loadoutState.secondary].title}</Text>
                <Image source={SECONDARY[loadoutState.secondary].image} resizeMode='contain' style={{ width: 256, height: 128, alignSelf: 'center' }}/>
                <Text/>
                <Button onPress={() => navigation.push('Gunsmith', { loadout: loadoutState, setter: updateState })}>GUNSMITH</Button>
              </Card>
            </>
            }
            <Text/>
            <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Perk1', { state: loadoutState, setter: updateState } ); }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> 
                <Image source={PERK1[loadoutState.perk1].image} resizeMode='contain' style={{ width: 64, height: 64, alignSelf: 'center' }}/>
                <View style={{ flex: .8 }}>
                  <Text style={{ color: theme['text-hint-color'], fontSize: 14, textAlign: 'right' }}>Perk 1</Text>
                  <Text category='h6' style={{ textAlign: 'right' }}>{PERK1[loadoutState.perk1].title}</Text>
                </View>
              </View>
            </Card>
            <Text/>
            <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Perk2', { state: loadoutState, setter: updateState } ); }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> 
                <Image source={PERK2[loadoutState.perk2].image} resizeMode='contain' style={{ width: 64, height: 64, alignSelf: 'center' }}/>
                <View style={{ flex: .8 }}>
                  <Text style={{ color: theme['text-hint-color'], fontSize: 14, textAlign: 'right' }}>Perk 2</Text>
                  <Text category='h6' style={{ textAlign: 'right' }}>{PERK2[loadoutState.perk2].title}</Text>
                </View>
              </View>
            </Card>
            <Text/>
            <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Perk3', { state: loadoutState, setter: updateState } ); }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> 
                <Image source={PERK3[loadoutState.perk3].image} resizeMode='contain' style={{ width: 64, height: 64, alignSelf: 'center' }}/>
                <View style={{ flex: .8 }}>
                  <Text style={{ color: theme['text-hint-color'], fontSize: 14, textAlign: 'right' }}>Perk 3</Text>
                  <Text category='h6' style={{ textAlign: 'right' }}>{PERK3[loadoutState.perk3].title}</Text>
                </View>
              </View>
            </Card>
            <Text/>
            <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Lethal', { state: loadoutState, setter: updateState } ); }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> 
                <View style={{ flex: .8 }}>
                  <Text style={{ color: theme['text-hint-color'], fontSize: 14 }}>Lethal</Text>
                  <Text category='h6'>{LETHAL[loadoutState.lethal].title}</Text>
                </View>
                <Image source={LETHAL[loadoutState.lethal].image} resizeMode='contain' style={{ width: 64, height: 64, alignSelf: 'center' }}/>
              </View>
            </Card>
            <Text/>
            <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%' }} onPress={() => { navigation.push('Tactical', { state: loadoutState, setter: updateState } ); }}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> 
                <View style={{ flex: .8 }}>
                  <Text style={{ color: theme['text-hint-color'], fontSize: 14 }}>Tactical</Text>
                  <Text category='h6'>{TACTICAL[loadoutState.tactical].title}</Text>
                </View>
                <Image source={TACTICAL[loadoutState.tactical].image} resizeMode='contain' style={{ width: 64, height: 64, alignSelf: 'center' }}/>
              </View>
            </Card>
            <Text/>
          </Layout>
        </ScrollView>
      </>
    )
  }
}

const GunsmithScreen = ({ navigation, route }) => {
  const theme = useTheme();

  const [ loadoutState, setLoadoutState ] = useState(route.params.loadout);
  const [ statState, setStatState ] = useState({ Accuracy: 0, Damage: 0, Range: 0, 'Fire Rate': 0, Mobility: 0, Control: 0 });
  const [ initState, setInit ] = useState(false);
  const [ weaponInfo, setWepInf ] = useState({});
  const [ attachInfo, setAttInf ] = useState(['e']);
  const [ statLookup, setStatLookup ] = useState({});

  const updateStats = () => {
    var stats = {};
    for (let type of Object.keys(statState)) {
      stats[type] = 0;
    }
    for (let attachment of Object.keys(loadoutState.pAttach)) {
      if (loadoutState.pAttach[attachment]['name'] != 'None') {
        for (let stat of statLookup[attachment][loadoutState.pAttach[attachment]['name']]) {
          stats[stat.label] += stat.value;
        }
      }
    }
    setStatState(JSON.parse(JSON.stringify(stats)));
  }

  useEffect(() => {
    (async () => {
      if (!initState)
        setWepInf(PRIMARY[loadoutState.primary].info);
      else
        updateStats();
    })();
  }, [initState]);

  useEffect(() => {
    if (!initState && weaponInfo.name) {
      setAttInf(PRIMARY[loadoutState.primary].attach);
    }
  }, [weaponInfo]);
  
  useEffect(() => {
    if (!initState && attachInfo[0] != 'e') {
      if ( !loadoutState.pAttach ) {
        console.log('constructing attach');
        var pAttach = {};
        for (var attach of attachInfo) {
          pAttach[attach.type] = { name: 'None' };
        }
        var temp = loadoutState;
        temp['pAttach'] = pAttach;
        setLoadoutState(temp);
      }

      const statDict = attachInfo.reduce((acc, type) => {
        acc[type.type] = type.data.reduce((stats, attach) => {
          stats[attach.name] = attach.statBars;
          return stats;
        }, {});
        return acc;
      }, {});
      setStatLookup(statDict);

      setInit(true);
    }
  }, [attachInfo]);

  useEffect(() => {
    if (initState) {
      updateStats();
    }

    route.params.setter(loadoutState);
  }, [loadoutState]);

  if ( !initState ) {
    return (
      <>
        <TopNavigation
          alignment='center'
          title='Loading...'
          accessoryLeft={() => <RenderBackAction/>}
        />
        <Layout style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner status='primary'/>
        </Layout>
      </>
    )
  } else {
    return (
      <>
        <TopNavigation
          alignment='center'
          title='Gunsmith'
          accessoryLeft={() => <RenderBackAction/>}
        />
        <Layout style={{ flex: 1 }}>
          <Text/>
          <Card style={{ backgroundColor: theme['background-basic-color-2'], borderWidth: 0, width: '95%', alignSelf: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 0.6 }}>
                <Text style={{ color: theme['text-hint-color'], fontSize: 14 }}>{weaponInfo.class + ' ' + weaponInfo.altName}</Text>
                <Text category='h6'>{PRIMARY[loadoutState.primary].title}</Text>
              </View>
              <Image source={PRIMARY[loadoutState.primary].image} resizeMode='contain' style={{ flex: 0.4, height: 60 }}/>
            </View>
            <Text/>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {weaponInfo.statBars.slice(0, 2).map(stat => (
                <View style={{ flex: 0.48 }}>
                  <View style={{ paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 'bold' }}>{stat.label}</Text>
                    <Text style={{ fontWeight: 'bold', color: (statState[stat.label] > 0 ? '#66FF66' : (statState[stat.label] < 0 ? '#FF6666' : '#FFFFFF')) }}>{stat.value + statState[stat.label]}</Text>
                  </View>
                  <ProgressBar animated={true} color={theme['text-primary-color']} progress={(stat.value + statState[stat.label]) / 100} width={null} borderRadius={0} />
                </View>
              ))}
            </View>
            <Text />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {weaponInfo.statBars.slice(2, 4).map(stat => (
                <View style={{ flex: 0.48 }}>
                  <View style={{ paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 'bold' }}>{stat.label}</Text>
                    <Text style={{ fontWeight: 'bold', color: (statState[stat.label] > 0 ? '#66FF66' : (statState[stat.label] < 0 ? '#FF6666' : '#FFFFFF')) }}>{stat.value + statState[stat.label]}</Text>
                  </View>
                  <ProgressBar animated={true} color={theme['text-primary-color']} progress={(stat.value + statState[stat.label]) / 100} width={null} borderRadius={0} />
                </View>
              ))}
            </View>
            <Text />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {weaponInfo.statBars.slice(4, 6).map(stat => (
                <View style={{ flex: 0.48 }}>
                  <View style={{ paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 'bold' }}>{stat.label}</Text>
                    <Text style={{ fontWeight: 'bold', color: (statState[stat.label] > 0 ? '#66FF66' : (statState[stat.label] < 0 ? '#FF6666' : '#FFFFFF')) }}>{stat.value + statState[stat.label]}</Text>
                  </View>
                  <ProgressBar animated={true} color={theme['text-primary-color']} progress={(stat.value + statState[stat.label]) / 100} width={null} borderRadius={0} />
                </View>
              ))}
            </View>
          </Card>
          <Text/>
          <GunsmithContext.Provider
            value={{
              stat: [ statState, setStatState ],
              loadout: [ loadoutState, setLoadoutState ]
            }}
          >
            <AttachStack attachInfo={attachInfo} gun={loadoutState.primary} state={loadoutState}/>
          </GunsmithContext.Provider>
        </Layout>
      </>
    );
  }
}

const SlotsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  
  const { loadout } = useContext(GunsmithContext);
  const [ loadoutState, setLoadoutState ] = loadout;

  const RightIcon = (props) => (
    <Icon {...props} name='chevron-right-outline'/>
  );

  const MinusIcon = (props) => (
    <Icon {...props} name='minus-outline'/>
  );

  const AttachIcon = ({ props, img }) => (
    <Image source={ATTACHIMG[route.params.gun][img]} resizeMode='contain' style={{ aspectRatio: 1, width: 40 }}/>
  );

  return (
    <ScrollView style={{ backgroundColor: theme['background-basic-color-1'] }}>
      {route.params.attachInfo.map(attach => (
        <ListItem
          style={{ backgroundColor: theme['background-basic-color-2'] }}
          title={attach.type}
          description={loadoutState.pAttach[attach.type]['name']}
          activeOpacity={0.4}
          accessoryLeft={loadoutState.pAttach[attach.type]['name'] != 'None' ? () => <AttachIcon img={loadoutState.pAttach[attach.type]['image']}/> : MinusIcon}
          accessoryRight={RightIcon}
          onPress={() => navigation.push('Selector', { attach: attach })}
        />
      ))}
    </ScrollView>
  )
};

const SelectorScreen = ({ navigation, route }) => {
  const theme = useTheme();

  const [ checked, setChecked ] = React.useState(route.params.loadout.pAttach[route.params.attach.type]['name']);
  const [ stats, setStats ] = React.useState([]);
  const [ image, setImage ] = React.useState('');

  const { stat } = useContext(GunsmithContext);
  const [ statState, setStatState ] = stat;
  const { loadout } = useContext(GunsmithContext);
  const [ loadoutState, setLoadoutState ] = loadout;

  const SlashIcon = (props) => (
    <Icon {...props} name='slash-outline'/>
  );

  const AttachIcon = ({ props, img }) => (
    <Image source={ATTACHIMG[route.params.gun][img]} resizeMode='contain' style={{ aspectRatio: 1, width: 40 }}/>
  );

  useEffect(() => {
    var temp = loadoutState;
    temp.pAttach[route.params.attach.type]['name'] = checked;
    if (checked != 'None') {
      temp.pAttach[route.params.attach.type]['image'] = image;
    }
    setLoadoutState(JSON.parse(JSON.stringify(temp)));

    // if (checked == 'None') {
    //   setStatState(statState);
    // } else {
    //   let temp = statState;
    //   for (let stat of stats) {
    //     temp[stat.label] += stat.value;
    //   }
    //   setStatState(JSON.parse(JSON.stringify(temp)));
    // }
  }, [checked]);

  return (
    <>
      <TopNavigation
        alignment='center'
        title={route.params.attach.type}
        accessoryLeft={() => <RenderBackAction/>}
        style={{ backgroundColor: theme['background-basic-color-2'] }}
      />
      <ScrollView style={{ backgroundColor: theme['background-basic-color-1'] }}>
        <ListItem
          style={{ backgroundColor: theme['background-basic-color-2'] }}
          title='None'
          description='No attachment in this slot.'
          activeOpacity={0.4}
          accessoryLeft={SlashIcon}
          accessoryRight={() => <Radio
            checked={checked == 'None'}
            onChange={() => setChecked('None')}/>}
          onPress={() => setChecked('None')}
        />
        {route.params.attach.data.map(attach => (
          <ListItem
            style={{ backgroundColor: theme['background-basic-color-2'] }}
            title={attach.name}
            description={attach.description}
            activeOpacity={0.4}
            accessoryLeft={() => <AttachIcon img={attach.image}/>}
            accessoryRight={() => <Radio
              checked={checked == attach.name}
              onChange={() => { setChecked(attach.name); setStats(attach.statBars); setImage(attach.image); }}/>}
            onPress={() => { setChecked(attach.name); setStats(attach.statBars); setImage(attach.image); }}
          />
        ))}
      </ScrollView>
    </>
  )
};

const AttachStack = ({ attachInfo, gun, state }) => {
  const theme = useTheme();
  
  return (
    <StackNav.Navigator screenOptions={{ headerShown: false }}>
      <StackNav.Screen name='Slots' component={SlotsScreen} initialParams={{ gun: gun, attachInfo: attachInfo, current: state }}/>
      <StackNav.Screen name='Selector' component={SelectorScreen} initialParams={{ gun: gun, loadout: state }} />
    </StackNav.Navigator>
  )
};

const AttachmentScreen = ({ navigation, route }) => (
  <>
    <TopNavigation
      alignment='center'
      title='Select Attachment'
      accessoryLeft={() => <RenderBackAction/>}
    />
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text category='h1' style={{textAlign:'center'}}>50 IN THE CLIP OR 80 IN THE DRUM</Text>
    </Layout>
  </>
);

const LoadoutStack = () => {
  const [ updateState, setUpdateState ] = useState(true);
  const [ modalState, setModalState ] = useState(false);
  const [ value, setValue ] = useState('');
  const [ nameSet, setNameSet ] = useState(() => () => console.log('name'));
  const [ delModal, delModalState ] = useState(false);
  const [ loadoutDel, setLoadoutDel ] = useState(() => () => console.log('del'));
  const [ navBack, setNavBack ] = useState(() => () => console.log('back'));

  return (
    <UserContext.Provider
      value={{
        modal: [ modalState, setModalState ],
        name: [ value, setValue ],
        update: [ updateState, setUpdateState ],
        nameSetter: [ nameSet, setNameSet ],
        delModal: [ delModal, delModalState ],
        loadoutDel: [ loadoutDel, setLoadoutDel ],
        navBack: [ navBack, setNavBack ]
      }}
    >
      <StackNav.Navigator screenOptions={{ headerShown: false }}>
        <StackNav.Screen name='Main' component={LoadoutTabNavigator} />
        <StackNav.Screen name='Primary' component={PrimaryWeaponsScreen} />
        <StackNav.Screen name='Secondary' component={SecondaryWeaponsScreen} />
        <StackNav.Screen name='Perk1' component={Perk1Screen} />
        <StackNav.Screen name='Perk2' component={Perk2Screen} />
        <StackNav.Screen name='Perk3' component={Perk3Screen} />
        <StackNav.Screen name='Lethal' component={LethalScreen} />
        <StackNav.Screen name='Tactical' component={TacticalScreen} />
        <StackNav.Screen name='Builder' component={AssemblyScreen} />
        <StackNav.Screen name='Gunsmith' component={GunsmithScreen} />
        <StackNav.Screen name='Attachment' component={AttachmentScreen} />
      </StackNav.Navigator>
      <Modal
        isVisible={modalState}
        onBackdropPress={() => setModalState(false)}>
        <Card style={{ alignItems: 'center', borderWidth: 0 }} disabled={true}>
          <Text style={{ textAlign: 'center' }}>Enter a new name for this loadout:</Text>
          <Text/>
          <Layout style={{ flexDirection: 'row' }}>
            <Input
              style={{ flex: 1 }}
              placeholder=''
              value={value}
              onChangeText={nextValue => setValue(nextValue)}
            />
          </Layout>
          <Text/>
          <Button onPress={() => { nameSet(value); setModalState(false); }}>
            RENAME
          </Button>
        </Card>
      </Modal>
      <Modal
        isVisible={delModal}
        onBackdropPress={() => delModalState(false)}>
        <Card style={{ alignItems: 'center', borderWidth: 0 }} disabled={true}>
          <Text style={{ textAlign: 'center' }}>Are you sure you want to delete this loadout?</Text>
          <Text/>
          <Button onPress={() => { loadoutDel(); setUpdateState(true); delModalState(false); navBack(); }}>
            DELETE
          </Button>
          <Text/>
          <Button onPress={() => { delModalState(false); }}>
            CANCEL
          </Button>
        </Card>
      </Modal>
    </UserContext.Provider>
  )
};

export default () => {
  return (
    <NavigationContainer independent={true}>
       <LoadoutStack/>
    </NavigationContainer>
  );
};
