"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/context/AuthContext";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  position: string;
  location: string;
  phone: string;
  bio: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    position: '',
    location: '',
    phone: '',
    bio: ''
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get user metadata from auth
      const { data: authData } = await supabase.auth.getUser();
      
      // Try to get extended profile data (you might want to create a profiles table)
      const baseProfile = {
        id: user!.id,
        email: user!.email!,
        full_name: authData.user?.user_metadata?.full_name || '',
        company: authData.user?.user_metadata?.company || '',
        position: authData.user?.user_metadata?.position || '',
        location: authData.user?.user_metadata?.location || '',
        phone: authData.user?.user_metadata?.phone || '',
        bio: authData.user?.user_metadata?.bio || '',
        created_at: user!.created_at
      };

      setProfile(baseProfile);
      setFormData({
        full_name: baseProfile.full_name,
        company: baseProfile.company,
        position: baseProfile.position,
        location: baseProfile.location,
        phone: baseProfile.phone,
        bio: baseProfile.bio
      });
    } catch (err: any) {
      setError('Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: formData
      });

      if (updateError) throw updateError;

      // Update local state
      if (profile) {
        setProfile({ ...profile, ...formData });
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        company: profile.company,
        position: profile.position,
        location: profile.location,
        phone: profile.phone,
        bio: profile.bio
      });
    }
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Failed to load profile information.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Verified
          </Badge>
          <Button
            variant="destructive"
            onClick={signOut}
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckIcon className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XMarkIcon className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Overview */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-xl">
                {profile.full_name || 'Anonymous User'}
              </CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Member since</div>
                <div className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              {profile.position && profile.company && (
                <div className="text-center pt-4 border-t">
                  <div className="text-sm text-gray-500 mb-1">Current Role</div>
                  <div className="font-medium">{profile.position}</div>
                  <div className="text-sm text-gray-600">{profile.company}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal and professional details
                </CardDescription>
              </div>
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center py-2">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.full_name || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center py-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{profile.email}</span>
                    <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  {editing ? (
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Enter your company"
                    />
                  ) : (
                    <div className="flex items-center py-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.company || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  {editing ? (
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Enter your position"
                    />
                  ) : (
                    <div className="flex items-center py-2">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.position || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center py-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.location || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center py-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.phone || 'Not specified'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself and your role..."
                    rows={4}
                  />
                ) : (
                  <div className="py-2 min-h-[60px]">
                    <p className="text-gray-700">
                      {profile.bio || 'No bio provided yet. Click edit to add information about yourself.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-gray-600">Download your assessment data and insights</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently remove your account and all data</p>
            </div>
            <Button variant="destructive" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 