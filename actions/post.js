import firebase from 'firebase';
import db from '../config/firebase';
import cloneDeep from 'lodash/cloneDeep';
import {allowNotifications, sendNotification, notifyAll} from './index'

export const updateTitle = (text) => {
    return { type: 'UPDATE_TITLE', payload: text }
}

export const updateCatagory = (text) => {
    return { type: 'UPDATE_CATAGORY', payload: text }
}

export const updateIncidenceDate = (date) => {
    return { type: 'UPDATE_INCIDENCE_DATE', payload: date }
}

export const updateDescription = (text) => {
    return { type: 'UPDATE_DESCRIPTION', payload: text }
}

export const updateLocation = (location) => {
    return { type: 'UPDATE_LOCATION', payload: location }
}

export const updatePostLocal = (post) => {
    return { type: 'UPDATE_POST', payload: post }
}

export const updateComment = (text) => {
    return { type: 'UPDATE_COMMENT', payload: text }
}

export const updateStatus = (text) => {
    return { type: 'UPDATE_STATUS', payload: text }
}

export const updatePrivacy = () => {
    return async (dispatch, getState) => {
        try {
            const post = getState().post;
            let value = false
            if(post.isPrivate){
                value = !isPrivate
            } else {
                value = true
            }

            return { type: 'UPDATE_PRIVACY', payload: value }

        } catch (e) {
            alert(e)
        }

    }
}

export const clearPost = () => {
    return { type: 'CLEAR_POST', payload: {state: 'empty'} }
}

export const updatePhotos = (url) => {
    return async (dispatch, getState) => {
        try {
            const { postPhotos } = getState().post
            if (postPhotos) {
                postPhotos.push(url)
                dispatch({ type: 'UPDATE_PHOTOS', payload: postPhotos })
            } else {
                let postPhotos = [url]
                dispatch({ type: 'UPDATE_PHOTOS', payload: postPhotos })
            }
        } catch (e) {
            alert(e)
        }

    }
}

export const uploadPost = () => {
    return async (dispatch, getState) => {
        try {
            const { post, user } = getState();
            
            const upload = {
                title: post.title,
                catagory: post.catagory || 'Other',
                loggedDate: new Date().getTime() || '',
                incidenceDate: new Date().getTime() || '',
                location: post.location || {},
                description: post.description || ' ',
                postPhotos: post.postPhotos || [],
                uid: user.uid,
                fullname: user.fullname,
                residence: user.residence,
                unit: user.unit,
                photo: user.photo || ' ',
                likes: [],
                status: 'Open',
                isPrivate: post.isPrivate
            }
            const ref = await db.collection('posts').doc();
            upload.id = ref.id;
            ref.set(upload);

            let _user = user;

            if(_user.posts && _user.posts.length>0){
                _user.posts.push(upload)
            } else {
                _user.posts = []
                _user.posts.push(upload)
            }


            dispatch(notifyAll('A new incidence has been loggeg by ' + user.fullname));
            dispatch({ type: 'LOGIN', payload: _user })
        } catch (e) {
            alert(e)
        }

    }
}

export const getUserPosts = (uid) => {
    return async (dispatch, getState) => {
        try {
           
            const posts = await db.collection('posts').where('uid', '==', uid).get();
            let resolvedPosts = []
            posts.forEach((post) => {
                resolvedPosts.push(post.data())
            })
            return resolvedPosts
        } catch (e) {
            alert(e)
        }

    }
}

export const updatePost = () => {
    return async (dispatch, getState) => {
        try {
            const { post, user } = getState();

            const activities =  await db.collection('activity').where('uid', '==', post.uid).get();
            activities.forEach(async (item) => {
                await db.collection('activity').doc(item.id).update({
                title : post.title,
                });
                })

            const newPost = await db.collection('posts').doc(post.id).set(post);

            return { type: 'UPDATE_POST', payload: newPost }
        } catch (e) {
            alert(e)
        }

    }
}

export const changeStatus = () => {
    return async (dispatch, getState) => {
        try {
            const post = getState().post;
            const user = getState().user;


            await db.collection('posts').doc(post.id).update({
                status: post.status
            });

            await db.collection('activity').doc().set({
                postId: post.id,
                title: post.title,
                actorId: user.uid,
                actorPhoto: user.photo,
                actorName: user.fullname,
                uid: post.uid,
                date: new Date().getTime(),
                status: post.status,
                type: 'STATUS'
            })
            dispatch(sendNotification(post.uid, 'Updated Your Incidence to ' + post.status), {Route: 'Status',  PostId: post.id})

        } catch (e) {
            alert(e)
        }

    }
}

export const deletePost = () => {
    return async (dispatch, getState) => {
        try {
            const { id } = getState().post;

            const posts = await db.collection('posts').doc(id).delete()

        } catch (e) {
            alert(e)
        }

    }
}

export const postComment = (text) => {
    return async (dispatch, getState) => {
        try {
            const user = getState().user;
            const post = getState().post;
            let comments = getState().comments

            const newComment = {
                comment: text,
                commentId: user.uid,
                postId: post.id,
                commenterName: user.fullname,
                commenterPhoto: user.photo || ' ',
                date: new Date().getTime(),
            }


            if(comments){
                comments.push(newComment)
            } else {
               
                comments = []
                comments.push(newComment)
            }

            await db.collection('comments').doc().set(newComment)

            await db.collection('activity').doc().set({
                postId: post.id,
                title: post.title,
                actorId: user.uid,
                actorPhoto: user.photo,
                actorName: user.fullname,
                uid: user.uid,
                date: new Date().getTime(),
                type: 'COMMENT',
                
            })
            dispatch(sendNotification(post.uid, 'Commented On Your Incident', {Route: 'Comment',  PostId: post.id}))
            return { type: 'UPDATE_COMMENTS', payload: comments }

        } catch (e) {
            alert(e)
        }

    }
}

export const likePost = (post) => {
    return async (dispatch, getState) => {
        try {
            const { uid, fullname, photo } = getState().user;

            post.likes.push(uid);

            const posts = await db.collection('posts').doc(post.id).update({
                likes: firebase.firestore.FieldValue.arrayUnion(uid)
            });
            db.collection('activity').doc().set({
                postId: post.id,
                title: post.title,
                actorId: uid,
                actorPhoto: photo,
                actorName: fullname,
                uid: post.uid,
                date: new Date().getTime(),
                type: 'LIKE'
            })
            dispatch(sendNotification(post.uid, 'Liked Your Incident', {Route: 'Like', PostId: post.id}))
            dispatch({ type: 'UPDATE_POST', payload: post })
        } catch (e) {
            alert(e)
        }

    }
}

export const unlikePost = (post) => {
    return async (dispatch, getState) => {
        try {
            const { uid } = getState().user;

            post.likes.pop(uid);

            const posts = await db.collection('posts').doc(post.id).update({
                likes: firebase.firestore.FieldValue.arrayRemove(uid)
            });
            const query = await db.collection('activity').where('postId', '==', post.id).where('actorId', '==', uid).get();
            query.forEach((response) =>
                response.ref.delete()
            )

            dispatch({ type: 'UPDATE_POST', payload: post })
        } catch (e) {
            alert(e)
        }

    }
}

