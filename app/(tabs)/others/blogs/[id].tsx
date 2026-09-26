import React from "react";
import { View } from "react-native";

import BlogDetailsScreen from "@/app/components/blogs/blog-details";

const ViewBlog = () => {
  return (
    <View className="flex-1">
      <BlogDetailsScreen />
    </View>
  );
};

export default ViewBlog;