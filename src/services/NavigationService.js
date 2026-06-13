import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Queue to hold navigation calls that arrive before navigator is ready
let pendingNavigation = null;

/**
 * Call this from NavigationContainer's onReady callback.
 * Flushes any navigation that was queued while the navigator was initializing.
 */
export function flushPendingNavigation() {
  if (pendingNavigation && navigationRef.isReady()) {
    const {name, params} = pendingNavigation;
    pendingNavigation = null;
    console.log('NavigationService: flushing pending navigation to', name, params);
    navigationRef.navigate(name, params);
  }
}

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    console.log('NavigationService: navigating to', name, params);
    navigationRef.navigate(name, params);
  } else {
    // Store the latest navigation request; it will be executed once navigator is ready
    console.log('NavigationService: navigator not ready, queuing navigation to', name, params);
    pendingNavigation = {name, params};
  }
}

export function resetAndNavigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name, params}],
    });
  } else {
    console.log('NavigationService: reset navigation not ready');
  }
}

export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}
