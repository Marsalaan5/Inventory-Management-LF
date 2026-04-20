
import React from 'react';
import * as Icon from 'react-feather';


export const getIconComponent = (iconName) => {
  if (!iconName) return null;
  

  const IconComponent = Icon[iconName];
  
  if (IconComponent) {
    return <IconComponent />;
  }
  
  
  console.warn(`Icon "${iconName}" not found in react-feather, using Circle as fallback`);
  return <Icon.Circle />;
};

export default getIconComponent;