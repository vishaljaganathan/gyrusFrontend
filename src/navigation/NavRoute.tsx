import { useNavigation } from '@react-navigation/native';



const Navigate = (sub: any) => {
  const navigation: any = useNavigation();
  navigation.navigate("StackNavigation", { screen: sub });
};

export default Navigate;
