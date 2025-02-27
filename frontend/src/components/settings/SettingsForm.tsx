"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useRef } from "react";
import {
  updateProfile,
  uploadProfilePicture,
  updatePassword,
  deleteProfilePicture,
} from "@/lib/settingsHandler";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";

export default function SettingsForm() {
  const { user, setUser } = useUserStore();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState(
    user?.profile_description || ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [isLoading, setIsLoading] = useState({
    profile: false,
    photo: false,
    password: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.user_photo) {
      setAvatarSrc(user.user_photo || undefined);
    } else {
      setAvatarSrc(undefined);
    }
  }, [user, user?.user_photo]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading((prev) => ({ ...prev, photo: true }));
      try {
        const response = await uploadProfilePicture(file);
        if ("success" in response && response.success) {
          setUser({ ...user, user_photo: `${response.data}?t=${Date.now()}` }); // Add timestamp to force refresh
          toast.success("Profile picture updated successfully.");
        } else {
          throw new Error("Failed to upload image");
        }
      } catch (error) {
        toast.error("Failed to upload profile picture. Please try again.");
      } finally {
        setIsLoading((prev) => ({ ...prev, photo: false }));
      }
    }
  };

  const handleUpdatePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = async () => {
    const result = await deleteProfilePicture();

    if ("success" in result && result.success) {
      setUser({ ...user, user_photo: null });
      toast.success("Profile picture deleted successfully.");
    } else {
      toast.error("Failed to delete profile picture. Please try again.");
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading((prev) => ({ ...prev, profile: true }));
    try {
      const result = await updateProfile(description);
      if (result) {
        setUser({ ...user, profile_description: description });
        toast.success("Profile updated successfully.");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPassword2) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsLoading((prev) => ({ ...prev, password: true }));

    try {
      const response = await updatePassword(
        currentPassword,
        newPassword,
        newPassword2
      );

      if (response.success) {
        toast.success(response.data);
        setCurrentPassword("");
        setNewPassword("");
        setNewPassword2("");
      } else {
        throw new Error(response.data);
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, password: false }));
    }
  };

  return (
    <>
      {/* Profile Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarSrc || undefined} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <Button onClick={handleUpdatePhoto} disabled={isLoading.photo}>
                {isLoading.photo ? "Uploading..." : "Update photo"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDeletePhoto}
                disabled={isLoading.photo}
              >
                Delete photo
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about yourself..."
              className="min-h-[200px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This will be displayed on your profile and in your public posts.
            </p>
          </div>
          <Button onClick={handleUpdateProfile} disabled={isLoading.profile}>
            {isLoading.profile ? "Saving..." : "Save Profile Changes"}
          </Button>
        </div>
      </div>

      <div className="border-t my-8"></div>

      {/* Security Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Security</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading.password}>
            {isLoading.password ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </>
  );
}
