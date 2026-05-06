import React from "react";
import { HStack, Spinner } from "@gluestack-ui/themed-native-base";



export const Loader = () => {
  return (
    <HStack space={1} justifyContent="center" position={"absolute"}>
      <Spinner
        color="warning.500"
        size="lg"
        accessibilityLabel="Loading posts"
      />
    </HStack>
  );
};
