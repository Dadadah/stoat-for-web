import { Trans } from "@lingui-solid/solid/macro";

import { CategoryButton, Checkbox, iconSize } from "@revolt/ui";

import MdMarkUnreadChatAlt from "@material-design-icons/svg/outlined/mark_unread_chat_alt.svg?component-solid";
import MdNotifications from "@material-design-icons/svg/outlined/notifications.svg?component-solid";
import MdSpeaker from "@material-design-icons/svg/outlined/speaker.svg?component-solid";
import {
  killServiceWorkerSubscription,
  setUpServiceWorkerSubscription,
  useClient,
} from "@revolt/client";
import { useState } from "@revolt/state";
import { batch, Show } from "solid-js";

/**
 * Notifications Page
 */
export default function Notifications(props: { isDesktop: boolean }) {
  const getClient = useClient();
  const state = useState();

  function toggleNotificationPermission() {
    if (state.notifications.getEnabled() !== "allowed") {
      Notification.requestPermission().then((permission) => {
        // Notifications at large are denied, deny push too
        if (permission === "denied") {
          batch(() => {
            state.notifications.setEnabled("denied");
            state.notifications.setPushEnabled("denied");
            killServiceWorkerSubscription(getClient());
          });
          // Notifications are allowed, but not push notifications
        } else {
          state.notifications.setEnabled("allowed");
        }
      });
      // Deny both types of notifications
    } else {
      batch(() => {
        state.notifications.setEnabled("denied");
        state.notifications.setPushEnabled("denied");
        killServiceWorkerSubscription(getClient());
      });
    }
  }

  function togglePushPermission() {
    if (state.notifications.getPushEnabled() !== "allowed") {
      Notification.requestPermission().then((permission) => {
        // Notifications at large are denied, deny push too
        if (permission === "denied") {
          batch(() => {
            state.notifications.setEnabled("denied");
            state.notifications.setPushEnabled("denied");
          });
          killServiceWorkerSubscription(getClient());
          // Notifications at large are allowed, including push
        } else {
          batch(() => {
            state.notifications.setEnabled("allowed");
            state.notifications.setPushEnabled("allowed");
          });
          setUpServiceWorkerSubscription(getClient());
        }
      });
      // Deny only push notifications
    } else {
      state.notifications.setPushEnabled("denied");
      killServiceWorkerSubscription(getClient());
    }
  }

  return (
    <CategoryButton.Group>
      <CategoryButton
        action={
          <Checkbox
            checked={state.notifications.getEnabled() === "allowed"}
            onChange={toggleNotificationPermission}
            onClick={(e) => e.stopPropagation()}
          />
        }
        onClick={toggleNotificationPermission}
        icon={<MdNotifications {...iconSize(22)} />}
        description={
          <Trans>
            Receive notifications while the app is open and in the background.
          </Trans>
        }
      >
        <Trans>Enable Desktop Notifications</Trans>
      </CategoryButton>
      <Show when={!props.isDesktop}>
        <CategoryButton
          action={
            <Checkbox
              checked={state.notifications.getPushEnabled() === "allowed"}
              onChange={togglePushPermission}
              onClick={(e) => e.stopPropagation()}
            />
          }
          onClick={togglePushPermission}
          icon={<MdMarkUnreadChatAlt {...iconSize(22)} />}
          description={
            <Trans>Receive push notifications while the app is closed.</Trans>
          }
        >
          <Trans>Enable Push Notifications</Trans>
        </CategoryButton>
      </Show>

      {/* This is not shown because it is disabled, but it is not commented out so that lingui will still process it. */}
      <Show when={false}>
        <CategoryButton.Collapse
          title={<Trans>Sounds</Trans>}
          icon={<MdSpeaker {...iconSize(22)} />}
        >
          <CategoryButton
            action={<Checkbox checked onChange={(value) => void value} />}
            onClick={() => void 0}
            icon="blank"
          >
            <Trans>Message Received</Trans>
          </CategoryButton>
          <CategoryButton
            action={<Checkbox onChange={(value) => void value} />}
            onClick={() => void 0}
            icon="blank"
          >
            <Trans>Message Sent</Trans>
          </CategoryButton>
          <CategoryButton
            action={<Checkbox checked onChange={(value) => void value} />}
            onClick={() => void 0}
            icon="blank"
          >
            <Trans>User Joined Call</Trans>
          </CategoryButton>
          <CategoryButton
            action={<Checkbox checked onChange={(value) => void value} />}
            onClick={() => void 0}
            icon="blank"
          >
            <Trans>User Left Call</Trans>
          </CategoryButton>
        </CategoryButton.Collapse>
      </Show>
    </CategoryButton.Group>
  );
}
