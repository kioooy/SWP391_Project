import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockEvents } from './mockData';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Lọc sự kiện theo khoảng thời gian
      const filteredEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return eventDate >= from && eventDate <= to;
      });

      return filteredEvents;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể tải danh sách sự kiện');
    }
  }
);

export const bookEvent = createAsyncThunk(
  'events/bookEvent',
  async ({ eventId, userId }, { getState, rejectWithValue }) => {
    try {
      // Giả lập độ trễ của API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const event = mockEvents.find(e => e.id === eventId);
      
      if (!event) {
        throw new Error('Không tìm thấy sự kiện');
      }

      if (event.currentDonors >= event.maxDonors) {
        throw new Error('Sự kiện đã đủ số lượng người đăng ký');
      }

      // Tăng số lượng người đăng ký
      event.currentDonors += 1;

      return {
        eventId,
        userId,
        status: 'confirmed'
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể đăng ký sự kiện');
    }
  }
);

const initialState = {
  events: [],
  loading: false,
  error: null,
  bookingStatus: null
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBookingStatus: (state) => {
      state.bookingStatus = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Book Event
      .addCase(bookEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingStatus = null;
      })
      .addCase(bookEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingStatus = 'success';
      })
      .addCase(bookEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingStatus = 'failed';
      });
  },
});

export const { clearError, clearBookingStatus } = eventsSlice.actions;

// Selectors
export const selectEvents = (state) => state.events.events;
export const selectEventsLoading = (state) => state.events.loading;
export const selectEventsError = (state) => state.events.error;
export const selectBookingStatus = (state) => state.events.bookingStatus;

export default eventsSlice.reducer; 