import {
  CommonActions,
  NavigationContainerRef} from "@react-navigation/native";

type RootStackParamList = {
  // Define your screen names and their params here
  Login: undefined;
  // ... other screens
};

export type AppNavigationProp = NavigationContainerRef<RootStackParamList>;

let navigator: AppNavigationProp | null;

function setTopLevelNavigator(navigatorRef: AppNavigationProp) {
  navigator = navigatorRef;
}

function navigate(routeName: keyof RootStackParamList, params?: any) {
  navigator?.dispatch(CommonActions.navigate({ name: routeName, params }));
}
export { setTopLevelNavigator, navigate };
