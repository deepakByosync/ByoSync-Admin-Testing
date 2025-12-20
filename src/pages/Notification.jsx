// ShopkeeperMessageForm.jsx
import React, { useState } from "react";
import "./Notification.css";
import Header from "../components/Header";
import axios from "axios";
import { env } from "../utils/config.js";

const Notification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text: '...' }

  // 📤 Cloudinary upload function
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log("files", file);
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_profile_upload"); // replace with your preset
    formData.append("cloud_name", "dqy77alt5"); // replace with your Cloudinary name
    // console.log("form0", formData
    // )
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ": " + pair[1]);
    // }
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dqy77alt5/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("Cloudinary Upload Response:", data);
      setImage(data.secure_url); // set image URL in state
      setStatus({ type: "success", text: "Image uploaded successfully!" });
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setStatus({ type: "error", text: "Image upload failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple validation
    if (!title.trim() || !message.trim()) {
      setStatus({
        type: "error",
        text: "Title and message are required",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      console.log("image", image);
      const payload = {
        title: title.trim(),
        message: message.trim(),
        image: image,
      };

      // optionally append query params (e.g., ?userId=123)
      const res = await axios.post(
        `${env.BASE_URL}/admin/send-notification-all-users`,
        payload,
        {
          withCredentials: true,
        }
      );
      console.log("response", res);
      // const data = await res.json();
      // console.log("data", data);

      if (res.status === 200) {
        setStatus({
          type: "success",
          text: res?.data?.message || "Message sent successfully!",
        });
        setTitle("");
        setMessage("");
        setImage("");
      } else {
        setStatus({
          type: "error",
          text: res?.data?.message || "Server error. Try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: "Network error. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="notification-page">
        <Header />
        <div className="msg-form-card">
          <h2 className="page-title">Send Message</h2>

          <form className="msg-form">
            <label className="field">
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Enter title"
                maxLength={120}
              />
            </label>

            <label className="field">
              <span>Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message..."
                maxLength={2000}
              />
            </label>
            {/* 🖼️ Image Upload */}
            <label className="field">
              <span>Upload Image </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>

            {/* ✅ Image Preview */}
            {image && (
              <div className="preview">
                <img src={image} alt="Uploaded Preview" width="200" />
              </div>
            )}

            {status && (
              <div
                className={`status ${status.type === "success" ? "ok" : "err"}`}
              >
                {status.text}
              </div>
            )}
          </form>
          <div className="actions">
            <button
              className="send-btn"
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
// Notification
