import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Create from "./pages/Create";
import { Home } from "./pages/Home";
import Login from "./pages/Login";

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/listings/create" element={<Create />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};