import { Route } from "react-router-dom";
import React from "react";
import { Button } from "antd";
import PropTypes from "prop-types";


const CustomButton = ({ onClick, children, type = "primary", disabled = false }) => {
  return (
    <Route>
      <Button onClick={onClick} type={type} disabled={disabled}>
        {children}
      </Button>
    </Route>
  );
}