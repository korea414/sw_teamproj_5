import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, Polygon, Circle } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';

const API_KEY = '---';

const LiveHealthNavigator = ({ navigation }) => {
  const [mode, setMode] = useState('explore');
  const [paths, setPaths] = useState([]);
  const [accidentZones, setAccidentZones] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedPathDetails, setSelectedPathDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialRegion, setInitialRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [selectedAccidentZone, setSelectedAccidentZone] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      };
      setInitialRegion(region);
      setCurrentLocationMarker(region);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      let location = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      };
      setCurrentLocationMarker(region);
      console.log(`Current Location: Latitude: ${region.latitude}, Longitude: ${region.longitude}`);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchPathsBasedOnMarker = async (pathType) => {
    if (!marker) return;

    setIsLoading(true);
    const { latitude, longitude } = marker;
    const delta = 0.5;
    const pathData = pathType === 'bicycle' ? 'lt_l_byclink' : 'LT_L_TRKROAD';
    let allFeatures = [];
    const pageSize = 200;
    let page = 1;
    let totalPages = 1;

    do {
      try {
        const response = await axios.get(`---`);
        if (response.data.response.result.featureCollection) {
          const features = response.data.response.result.featureCollection.features;
          allFeatures = allFeatures.concat(features);
          const totalRecords = response.data.response.record.total;
          totalPages = Math.ceil(totalRecords / pageSize);
        }
      } catch (error) {
        console.error(error);
        break;
      }
      page++;
    } while (page <= totalPages);

    const pathsData = allFeatures.map((feature, index) => {
      const path = {
        id: `path-${pathType}-${index}`,
        name: feature.properties['l_name'] || feature.properties['dct_name'] || feature.properties['cos_nam'],
        coordinates: feature.geometry.coordinates.flatMap(line =>
          line.map(coord => ({
            latitude: parseFloat(coord[1]),
            longitude: parseFloat(coord[0])
          }))
        ),
        pathType: pathType
      };
      if (pathType === 'walk') {
        const lenTim = feature.properties['len_tim'];
        path.timeLength = lenTim ? (lenTim.match(/(\d+시간)/g) ? lenTim.match(/(\d+시간)/g).join(' ') : '정보 없음') : '정보 없음';
        path.pathLength = (feature.properties['leng_lnk'] / 1000).toFixed(2) + ' km';
      } else if (pathType === 'bicycle') {
        path.pathLength = (feature.properties['length'] / 1000).toFixed(2) + ' km';
      }
      return path;
    });

    setPaths(pathsData);
    setIsLoading(false);
    fetchAccidentZones(latitude, longitude);
  };

  const fetchAccidentZones = async (latitude, longitude) => {
    const delta = 0.5;
    try {
      const response = await axios.get(`--`, {
        params: {
          serviceKey: decodeURIComponent(API_KEY),
          searchYearCd: 2021,
          siDo: '',
          guGun: '',
          type: 'json',
          numOfRows: 1000,
          pageNo: 1,
        }
      });
      if (response.data?.items?.item) {
        const accidentData = response.data.items.item.map((item, index) => ({
          id: `accident-${index}`,
          latitude: parseFloat(item.la_crd),
          longitude: parseFloat(item.lo_crd),
          description: `발생 건수: ${item.occrrnc_cnt}, 사망자 수: ${item.caslt_cnt}`
        }));
        setAccidentZones(accidentData);
      }
    } catch (error) {
      console.error('Error fetching accident zones:', error);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedPath(null);
    setSelectedPathDetails("");
    if (mode === 'walk' || mode === 'bike') {
      setMarker({ latitude, longitude });
    }
  };

  const handlePolylinePress = (pathId) => {
    if (mode === 'explore') {
      const selected = paths.find(path => path.id === pathId);
      if (selected) {
        if (selected.pathType === 'bicycle') {
          const selectedPaths = paths.filter(path => path.name === selected.name).map(path => path.id);
          const totalLength = paths.filter(path => path.name === selected.name).reduce((sum, path) => sum + parseFloat(path.pathLength), 0).toFixed(2) + ' km';
          setSelectedPath(selectedPaths);
          setSelectedPathDetails(`${selected.name} (길이: ${totalLength})`);
        } else {
          setSelectedPath(pathId);
          setSelectedPathDetails(`${selected.name} ${selected.id.replace('path-walk-', '')}코스\n길이: ${selected.pathLength}\n소요시간: ${selected.timeLength}`);
        }
      } else {
        setSelectedPath(null);
        setSelectedPathDetails("");
      }
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleConfirmButtonClick = () => {
    if (mode === 'walk' || mode === 'bike') {
      fetchPathsBasedOnMarker(mode === 'walk' ? 'walk' : 'bicycle');
    }
    setMode('explore');
  };

  const handleAccidentZonePress = (zone) => {
    setSelectedAccidentZone(zone);
  };

  const getTriangleCoordinates = (center, size) => {
    const { latitude, longitude } = center;
    const angle = (2 * Math.PI) / 3;
    const distance = 0.1 * size; // Adjust size factor for your requirement

    const coordinates = [];
    for (let i = 0; i < 3; i++) {
      coordinates.push({
        latitude: latitude + (distance * Math.cos(angle * i)),
        longitude: longitude + (distance * Math.sin(angle * i)),
      });
    }
    return coordinates;
  };

  const handleGoHome = () => {
    navigation.navigate('Main'); // 홈으로 돌아가기
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          onPress={handleMapPress}
        >
          {paths.map((path, index) => (
            <Polyline
              key={path.id}
              coordinates={path.coordinates}
              strokeWidth={Array.isArray(selectedPath) ? (selectedPath.includes(path.id) ? 8 : 4) : (selectedPath === path.id ? 8 : 4)}
              strokeColor={Array.isArray(selectedPath) ? (selectedPath.includes(path.id) ? '#007AFF' : '#FF6347') : (selectedPath === path.id ? '#007AFF' : '#FF6347')}
              onPress={() => handlePolylinePress(path.id)}
              tappable={true}
            />
          ))}
          {currentLocationMarker && (
            <Marker
              coordinate={{ latitude: currentLocationMarker.latitude, longitude: currentLocationMarker.longitude }}
              title="내 위치"
              pinColor="blue"
            />
          )}
          {marker && (
            <>
              <Marker
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              />
              <Circle
                center={{ latitude: marker.latitude, longitude: marker.longitude }}
                radius={50000} // 반경을 원하는 크기로 조정하세요 (미터 단위)
                fillColor="rgba(135,206,250,0.5)"
                strokeColor="rgba(0,191,255,1)"
                strokeWidth={2}
              />
            </>
          )}
          {accidentZones.map(zone => (
            <Polygon
              key={zone.id}
              coordinates={getTriangleCoordinates({ latitude: zone.latitude, longitude: zone.longitude }, 0.01)}
              fillColor={selectedAccidentZone && selectedAccidentZone.id === zone.id ? "rgba(0, 0, 255, 0.5)" : "rgba(255, 0, 0, 0.5)"}
              strokeColor={selectedAccidentZone && selectedAccidentZone.id === zone.id ? "rgba(0, 0, 255, 1)" : "rgba(255, 0, 0, 1)"}
              tappable={true}  // Add this line
              onPress={() => handleAccidentZonePress(zone)}  // Add this line
            />
          ))}
        </MapView>
      )}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {selectedPath && mode === 'explore' && (
        <View style={styles.detailsPanel}>
          <Text style={styles.detailsText}>
            {selectedPathDetails}
          </Text>
        </View>
      )}
      {selectedAccidentZone && (
        <View style={styles.accidentDetailsPanel}>
          <Text style={styles.detailsText}>
            {selectedAccidentZone.description}
          </Text>
        </View>
      )}
      {mode === 'explore' && (
        <View style={styles.bottomPanel}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleModeChange('walk')}>
            <Text style={styles.actionButtonText}>산책로 찾기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleModeChange('bike')}>
            <Text style={styles.actionButtonText}>자전거길 찾기</Text>
          </TouchableOpacity>
        </View>
      )}
      {mode !== 'explore' && (
        <View style={styles.promptPanel}>
          <Text style={styles.promptText}>지도에서 위치를 선택해주세요</Text>
        </View>
      )}
      {mode !== 'explore' && (
        <View style={styles.bottomPanel}>
          <TouchableOpacity style={styles.actionButton} onPress={handleConfirmButtonClick}>
            <Text style={styles.actionButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <FontAwesome name="home" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    width: '100%',
    padding: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    width: 170,
    height: 60,
    margin: 5,
    marginHorizontal: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 16 * 1.2,
  },
  promptPanel: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
  },
  promptText: {
    textAlign: 'center',
    fontSize: 16,
  },
  detailsPanel: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 15,
    width: '80%',
    alignSelf: 'center',
  },
  detailsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  accidentDetailsPanel: {
    position: 'absolute',
    top: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 15,
    width: '80%',
    alignSelf: 'center',
  },
  homeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#4285F4',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiveHealthNavigator;
