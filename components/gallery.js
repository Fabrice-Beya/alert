import React from 'react';
import { View, Image, ScrollView, TouchableOpacity } from 'react-native';

import styles from '../styles';

export default ({ captures = [], navigation }) => (
    <ScrollView
        horizontal={true}
        style={[styles.bottomToolbar, styles.galleryContainer]}
    >
        {captures.map(({ uri }) => (
            <View style={styles.galleryImageContainer} key={uri}>
                <TouchableOpacity onPress={() => navigation.navigate('MediaView', {Item: uri})}>
                    <Image source={{ uri }} style={styles.galleryImage} />
                </TouchableOpacity>
            </View>
        ))}
    </ScrollView>
);